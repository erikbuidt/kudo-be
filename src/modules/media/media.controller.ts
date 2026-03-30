import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { PresignedUrlDto } from './presigned-url.dto';

@ApiTags('Media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('presigned-url')
  @ApiOperation({
    summary: 'Get a presigned URL for direct file upload to MinIO',
  })
  @ApiQuery({
    name: 'filename',
    required: true,
    type: String,
    example: 'image.png',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the PUT url and final public media url',
  })
  getPresignedUrl(@Query() query: PresignedUrlDto) {
    return this.mediaService.getPresignedUrl(query.filename);
  }
}
