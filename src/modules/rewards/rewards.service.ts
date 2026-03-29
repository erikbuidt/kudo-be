import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/package/prisma/prisma.service'
import type { RedeemRewardDto } from './redeem-reward.dto'
import type { Prisma } from '@/generated/prisma/client'

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.reward.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { point_cost: 'asc' },
    })
  }

  async redeemReward(userId: string, dto: RedeemRewardDto, idempotencyKey: string) {
    // --- Idempotency pre-check ---
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    })

    if (existing) {
      if (existing.status === 'COMPLETED') {
        //throw error
        throw new BadRequestException('This request has already been processed.')
      }
      // PROCESSING means a concurrent request is already running
      throw new BadRequestException('This request is already being processed. Please try again shortly.')
    }

    // --- Claim the key immediately (acts as a distributed lock) ---
    await this.prisma.idempotencyRecord.create({
      data: {
        key: idempotencyKey,
        user_id: userId,
        request_type: 'REDEEM_REWARD',
        status: 'PROCESSING',
      },
    })

    // --- Main transaction ---
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const users = await tx.$queryRaw<{ received_balance: number }[]>`
          SELECT received_balance FROM users WHERE id = ${userId} FOR UPDATE
        `
        const user = users[0]
        if (!user) throw new NotFoundException('User not found')

        const reward = await tx.reward.findUnique({ where: { id: dto.reward_id } })
        if (!reward) throw new NotFoundException('Reward not found')
        if (reward.stock <= 0) throw new BadRequestException('Reward is out of stock')

        if (user.received_balance < reward.point_cost) {
          throw new BadRequestException(
            `Insufficient balance. You have ${user.received_balance} pts, need ${reward.point_cost} pts.`,
          )
        }

        await tx.user.update({
          where: { id: userId },
          data: { received_balance: { decrement: reward.point_cost } },
        })

        await tx.reward.update({
          where: { id: dto.reward_id },
          data: { stock: { decrement: 1 } },
        })

        return tx.redemption.create({
          data: { user_id: userId, reward_id: dto.reward_id },
          include: { reward: true },
        })
      })

      // --- Mark COMPLETED and cache the result ---
      await this.prisma.idempotencyRecord.update({
        where: { key: idempotencyKey },
        data: {
          status: 'COMPLETED',
          response: result as unknown as Prisma.InputJsonValue,
        },
      })

      return result
    } catch (err) {
      // --- Mark FAILED so the key can be retried in a new minute ---
      await this.prisma.idempotencyRecord.update({
        where: { key: idempotencyKey },
        data: { status: 'FAILED' },
      }).catch(() => { /* best-effort, don't mask original error */ })

      throw err
    }
  }

  getMyRedemptions(userId: string) {
    return this.prisma.redemption.findMany({
      where: { user_id: userId },
      include: { reward: true },
      orderBy: { created_at: 'desc' },
    })
  }
}
