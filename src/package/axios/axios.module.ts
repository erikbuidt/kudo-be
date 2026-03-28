import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { AxiosService } from './axios.service'

@Global()
@Module({
  imports: [HttpModule],
  exports: [AxiosService],
  providers: [AxiosService],
})
export class AxiosModule {}
