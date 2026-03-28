import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ReactionsService } from './reactions.service'
import { ToggleReactionDto } from './toggle-reaction.dto'

@ApiTags('Reactions')
@ApiBearerAuth('access-token')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle a reaction on a kudo (add if absent, remove if present)' })
  toggle(@Request() req: { user: { id: string } }, @Body() dto: ToggleReactionDto) {
    return this.reactionsService.toggleReaction(req.user.id, dto)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get grouped reaction counts for a kudo' })
  @ApiQuery({ name: 'kudo_id', required: true, type: String })
  summary(@Query('kudo_id') kudoId: string) {
    return this.reactionsService.getReactionSummary(kudoId)
  }
}
