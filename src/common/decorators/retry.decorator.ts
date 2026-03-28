import { isAxiosError } from '@nestjs/terminus/dist/utils'
import { Logger } from 'http-system-logger'

export const Retry = (
  retries: number,
  delay: number,
  condition?: {
    when: {
      statusCode: number
    }
  },
): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const logger = new Logger('RetryDecorator')

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    descriptor.value = async function (...args: any[]) {
      let attempts = 0
      while (attempts <= retries) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          attempts++
          if (attempts > retries || (condition && isAxiosError(error) && error.response?.status !== condition.when.statusCode)) {
            if (isAxiosError(error)) {
              throw error.response?.data
            }
            throw error
          }
          logger.info(`Attempt ${attempts} failed:`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }
    return descriptor
  }
}
