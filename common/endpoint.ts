
import * as express from 'express'
export interface HygieneBaseContext {
  req: express.Request
}
 
export type EndpointFunc<Request = any, Response = any, Context extends HygieneBaseContext = any> = (context: Context, input: Request) => Promise<Response> 