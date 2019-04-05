
import { HTTPRequest } from './http';
export interface HygieneBaseContext {
  req: HTTPRequest
}
 
export type EndpointFunc<Input = any, Output = any, Context extends HygieneBaseContext = HygieneBaseContext> = (context: Context, req: Input) => Promise<Output> 
