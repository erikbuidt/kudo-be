import { HttpException, HttpStatus } from '@nestjs/common'
import type { IAppError, IError } from './interface.error'

export class AppException extends HttpException {
  constructor(private readonly error: IAppError) {
    super(error, error.status)
  }

  override getResponse(): IError {
    return {
      status: this.error.status,
      code: this.error.code,
      time: new Date().toISOString(),
      message: this.error.message,
    }
  }
}
