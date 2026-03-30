import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to a kudo' })
  addComment(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a kudo' })
  @ApiQuery({ name: 'kudo_id', required: true, type: String })
  getComments(@Query('kudo_id') kudoId: string) {
    return this.commentsService.getComments(kudoId);
  }
}
