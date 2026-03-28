import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class RedeemRewardDto {
  @ApiProperty({ example: 'uuid-of-reward', description: 'ID of the reward to redeem' })
  @IsUUID()
  reward_id: string
}
