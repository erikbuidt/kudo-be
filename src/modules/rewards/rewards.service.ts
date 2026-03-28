import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/package/prisma/prisma.service'
import type { RedeemRewardDto } from './redeem-reward.dto'

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.reward.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { point_cost: 'asc' },
    })
  }

  async redeemReward(userId: string, dto: RedeemRewardDto) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the user row to prevent concurrent double-spends
      const users = await tx.$queryRaw<{ received_balance: number }[]>`
        SELECT received_balance FROM users WHERE id = ${userId}::uuid FOR UPDATE
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
  }
}
