import { HygieneBaseContext } from "./endpoint";


export type Middleware<Context extends HygieneBaseContext = HygieneBaseContext> = (ctx: Context) => Promise<void>

export async function applyMiddlwares(context: HygieneBaseContext, middlewares: Middleware[] = []) {
  for (let middleware of middlewares) {
    await middleware(context)
  }
}