import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CoreValue, MediaType } from '@/generated/prisma/enums'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateKudoDto {
  @ApiProperty({ example: 'uuid-of-receiver', description: 'ID of the user receiving the kudo' })
  @IsUUID()
  receiver_id: string

  @ApiProperty({ example: 25, minimum: 10, maximum: 50, description: 'Points to award (10–50)' })
  @IsInt()
  @Min(10)
  @Max(50)
  points: number

  @ApiProperty({ example: 'Amazing work on the Q1 presentation!' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ enum: CoreValue, example: CoreValue.TEAMWORK })
  @IsEnum(CoreValue)
  core_value: CoreValue

  @ApiPropertyOptional({ example: 'https://s3.example.com/media/kudo-123.png' })
  @IsOptional()
  @IsString()
  media_url?: string

  @ApiPropertyOptional({ enum: MediaType, example: MediaType.IMAGE })
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType
}

export class FeedQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10
}
