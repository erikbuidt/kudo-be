import { AsyncLocalStorage } from 'async_hooks';

interface Context {
  userId: string;
}

/**
 * RequestContext provides async-local storage for request-scoped context
 * Used to track the current user ID for audit fields in Prisma middleware
 */
export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<Context>();

  static run(context: Context, callback: () => void) {
    this.storage.run(context, callback);
  }

  static getUserId(): string | undefined {
    const store = this.storage.getStore();
    return store?.userId;
  }
}
