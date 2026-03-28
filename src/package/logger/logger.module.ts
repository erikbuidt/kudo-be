import { Global, Module } from '@nestjs/common'
import { Logger } from 'http-system-logger'
@Global()
@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
