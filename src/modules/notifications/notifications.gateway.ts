import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { Logger } from '@nestjs/common'

export interface NotificationPayload {
  type: 'kudo_received' | 'comment_added' | 'reaction_added'
  message: string
  data: Record<string, unknown>
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/notifications' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server


  private readonly logger = new Logger(NotificationsGateway.name)

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token as string | undefined
      if (!token) throw new Error('No token')

      const payload = this.jwtService.verify<{ sub: string }>(token)
      const userId = payload.sub

      socket.data.userId = userId

      // Joining the room is all we need. 
      // The Redis adapter will automatically pub/sub to this room across all server instances!
      socket.join(`user:${userId}`)
      this.logger.log(`User ${userId} connected (socketId=${socket.id})`)
    } catch {
      this.logger.warn(`Unauthorized WebSocket connection — disconnecting ${socket.id}`)
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string | undefined
    if (userId) {
      this.logger.log(`User ${userId} disconnected (socketId=${socket.id})`)
    }
  }

  /** Push a notification to all sockets belonging to `userId` */
  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', payload)
  }
}
