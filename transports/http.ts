import * as express from 'express'
import { newGlobError, GlobErrorType } from '../common/errors';
import { EndpointFunc } from '../common/endpoint';
import { Middleware, applyMiddlwares } from '../common/middlewares';

export class Response<T> {
  data: T
  code: number
  constructor(code: number, data: T) {
    this.code = code
    this.data = data
  }
}

export class Request {
  private req: express.Request

  constructor(req: express.Request) {
    this.req = req
  }
  GetBody = () => {
    return this.req.body
  }

  GetBodyOrThrow = () => {
    if(typeof this.req.body === "undefined") {
      throw newGlobError(GlobErrorType.InputError, "Invalid body")
    }
    return this.req.body
  }

  GetQuery = (key: string): string => {
    return this.req.query[key]
  }

  GetQueryOrThrow = (key: string): string => {
    if(typeof this.req.query[key] === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, `Query parameter name ${key} is required`)
    }
    return this.req.query[key]
  }

  GetParam = (key: string): string => {
    return this.req.params[key]
  }

  GetParamOrThrow = (key: string): string => {
    if(typeof this.req.params[key] === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, `Param parameter name ${key} is required`)
    }
    return this.req.params[key]
  }

  
}

export type ResponseEncoder<Output> = (output: Output) => Response<Output>
export type ResponseDecoder<Output> = (output: Response<Output>) => Output

export type RequestDecoder<Input> = (c: Request) => Input
export type RequestEncoder<Input> = (input: Input) => Request

export function newHTTPResolver<In, Out>(endpoint: EndpointFunc<In, Out>, decoder: RequestDecoder<In>, encoder: ResponseEncoder<Out>, ...middlewares: Middleware[]) { 
  return async (req: express.Request, res: express.Response) => {
    const ctx = {
      req,
    }
    await applyMiddlwares(ctx, middlewares)
    const input = await decoder(new Request(req))
    const output = await endpoint(ctx, input)

  }
}