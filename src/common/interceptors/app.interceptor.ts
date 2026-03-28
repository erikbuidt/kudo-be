import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import type { Request, Response } from "express"
import { RequestContext } from "@/common/providers/request-context.provider"

interface IApiPassedRes<T> {
  status: number
  code: string
  data: T
}

export class AppInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiPassedRes<T> | Promise<Observable<IApiPassedRes<T>>>> {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request & { id: string; user?: { db_user_id: string; role: "string" } }>()
    const res = ctx.getResponse<Response>()
    const userId = req.user?.db_user_id ?? "anonymous"
    res.header("x-request-id", req.id)
    return new Observable<IApiPassedRes<T>>((subscriber) => {
      RequestContext.run({ userId }, () => {
        next
          .handle()
          .pipe(map((data: T) => this.formatResponse(data)))
          .subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          })
      })
    })
  }

  private formatResponse(data: T): IApiPassedRes<T> {
    return { status: 200, code: "000", data: data }
  }
}
