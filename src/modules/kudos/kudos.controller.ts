import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { KudosService } from './kudos.service'
import { CreateKudoDto, FeedQueryDto } from './create-kudo.dto'

@ApiTags('Kudos')
@ApiBearerAuth('access-token')
@Controller('kudos')
export class KudosController {
  constructor(private readonly kudosService: KudosService) { }

  @Post()
  @ApiOperation({ summary: 'Send a kudo to another user' })
  @ApiResponse({ status: 201, description: 'Kudo created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient budget' })
  @ApiResponse({ status: 403, description: 'Insufficient giving budget' })
  createKudo(@Request() req: { user: { id: string } }, @Body() dto: CreateKudoDto) {
    return this.kudosService.createKudo(req.user.id, dto)
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get paginated kudo feed' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of kudos with counts' })
  getFeed(@Request() req: { user?: { id: string } }, @Query() query: FeedQueryDto) {
    return this.kudosService.getFeed(query, req.user?.id)
  }

  @Get('top-values')
  @ApiOperation({ summary: 'Get top 3 core values used this week' })
  @ApiResponse({ status: 200, description: 'List of top core values with counts' })
  getTopCoreValuesThisWeek() {
    return this.kudosService.getTopCoreValuesThisWeek()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific kudo' })
  @ApiResponse({ status: 200, description: 'Kudo found' })
  @ApiResponse({ status: 404, description: 'Kudo not found' })
  getKudo(@Request() req: { user?: { id: string } }, @Param('id') id: string) {
    return this.kudosService.getKudo(id, req.user?.id)
  }
}
