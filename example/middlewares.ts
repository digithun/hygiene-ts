import { Middleware } from '../lib/middleware'
import { newGlobError, GlobErrorType } from '../lib/errors';

export function newAPIKeyMiddleware(key: string): Middleware {
  return async function(ctx) {

    const apiKey = ctx.req.GetHeaderOrThrow('x-api-key')
    if (apiKey !== key) {
      throw newGlobError(GlobErrorType.ForbiddenError, "Invalid API key")  
    }

  }
}
