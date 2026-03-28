// biome-ignore lint/style/useImportType: <explanation>
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const apiKey = request.headers["apikey"]
    if (!apiKey) {
      return false
    }
    return apiKey === process.env.CLERK_API_KEY
  }
}
