import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@/package/prisma/prisma.service'

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reset all users' giving_budget to 200 at midnight on the 1st of every month.
   * Cron: 0 0 1 * * (second, minute, hour, day-of-month, month)
   */
  @Cron('0 0 1 * *')
  async resetGivingBudgets() {
    this.logger.log('Running monthly giving_budget reset...')
    const result = await this.prisma.user.updateMany({
      data: { giving_budget: 200 },
    })
    this.logger.log(`Reset giving_budget for ${result.count} users`)
  }
}
