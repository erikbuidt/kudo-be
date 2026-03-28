import { AsyncLocalStorage } from "async_hooks"

interface Context {
  userId: string
}

/**
 * RequestContext provides async-local storage for request-scoped context
 * Used to track the current user ID for audit fields in Prisma middleware
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<Context>()

  static run(context: Context, callback: () => void) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    this.storage.run(context, callback)
  }

  static getUserId(): string | undefined {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const store = this.storage.getStore()
    return store?.userId
  }
}
