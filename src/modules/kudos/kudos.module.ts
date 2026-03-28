import { Module } from '@nestjs/common'
import { KudosService } from './kudos.service'
import { KudosController } from './kudos.controller'

@Module({
  controllers: [KudosController],
  providers: [KudosService],
})
export class KudosModule {}
