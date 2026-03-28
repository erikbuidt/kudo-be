import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({ example: 'uuid-of-kudo', description: 'Kudo to comment on' })
  @IsUUID()
  kudo_id: string

  @ApiProperty({ example: 'Great job! Well deserved 🎉' })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiPropertyOptional({ example: 'https://s3.example.com/media/reaction.gif' })
  @IsOptional()
  @IsString()
  media_url?: string
}
