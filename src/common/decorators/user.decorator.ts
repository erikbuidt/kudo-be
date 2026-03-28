import { createParamDecorator, type ExecutionContext } from "@nestjs/common"

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user // or request.user.id if you only want id
})
