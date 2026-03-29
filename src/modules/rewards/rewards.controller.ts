import { BadRequestException, Body, Controller, Get, Headers, Post, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger'
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
  @ApiHeader({ name: 'X-Idempotency-Key', description: 'Deterministic hash to prevent duplicate redemptions', required: true })
  @ApiResponse({ status: 201, description: 'Redemption created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance, out of stock, or missing idempotency key' })
  redeem(
    @Request() req: { user: { id: string } },
    @Body() dto: RedeemRewardDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('X-Idempotency-Key header is required')
    }
    return this.rewardsService.redeemReward(req.user.id, dto, idempotencyKey)
  }

  @Get('redemptions/me')
  @ApiOperation({ summary: 'Get current user redemptions' })
  @ApiResponse({ status: 200, description: 'Array of user redemptions' })
  getMyRedemptions(@Request() req: { user: { id: string } }) {
    return this.rewardsService.getMyRedemptions(req.user.id)
  }
}
