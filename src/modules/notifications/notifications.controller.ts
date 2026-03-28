import { Controller, Get, Patch, Param, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Returns a list of notifications' })
  getUserNotifications(@Request() req: { user: { id: string } }) {
    return this.notificationsService.getUserNotifications(req.user.id)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Request() req: { user: { id: string } }) {
    return this.notificationsService.getUnreadCount(req.user.id)
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id)
  }
}
