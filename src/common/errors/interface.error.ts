import type { HttpStatus } from '@nestjs/common'

export interface IError {
  status: HttpStatus
  time: string
  code: string
  message: string
}

export interface IAppError {
  code: string
  status: HttpStatus
  message: string
}
