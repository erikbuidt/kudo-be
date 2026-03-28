import { Body, Controller, Get, Post, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { RewardsService } from './rewards.service'
import { RedeemRewardDto } from './redeem-reward.dto'

@ApiTags('Rewards')
@ApiBearerAuth('access-token')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all available rewards' })
  @ApiResponse({ status: 200, description: 'Array of rewards with stock > 0' })
  findAll() {
    return this.rewardsService.findAll()
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a reward using received_balance' })
  @ApiResponse({ status: 201, description: 'Redemption created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or out of stock' })
  redeem(@Request() req: { user: { id: string } }, @Body() dto: RedeemRewardDto) {
    return this.rewardsService.redeemReward(req.user.id, dto)
  }

  @Get('redemptions/me')
  @ApiOperation({ summary: 'Get current user redemptions' })
  @ApiResponse({ status: 200, description: 'Array of user redemptions' })
  getMyRedemptions(@Request() req: { user: { id: string } }) {
    return this.rewardsService.getMyRedemptions(req.user.id)
  }
}
