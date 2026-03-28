import { Global, Module } from '@nestjs/common'
import { NotificationsGateway } from './notifications.gateway'
import { AuthModule } from '../auth/auth.module'

@Global()
@Module({
  imports: [AuthModule], // provides JwtModule/JwtService
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
