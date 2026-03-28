import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class ToggleReactionDto {
  @ApiProperty({ example: 'uuid-of-kudo', description: 'Kudo to react to' })
  @IsUUID()
  kudo_id: string

  @ApiProperty({ example: '❤️', description: 'Emoji for the reaction' })
  @IsString()
  @IsNotEmpty()
  emoji: string
}
