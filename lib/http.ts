import * as express from 'express'
import { newGlobError, GlobErrorType } from './errors'
import { EndpointFunc, HygieneBaseContext } from './endpoint'
import { Middleware, applyMiddlwares } from './middleware'

export class Response<T = any> {
  data: T
  code: number

  headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  }

  constructor(data: T) {
    this.data = data
    this.code = 200
  }

  setHeader = (key: string, value: string) => {
    this.headers[key] = value
    return this
  }

  setData = (data: T) => {
    this.data = data
    return this
  }
  setStatusCode(code: number) {
    this.code = code
    return this
  }
}

export function newHTTPResponse<T>(data: T) {
  return new Response<T>(data)
}

export class HTTPRequest {
  private req: express.Request

  constructor(req: express.Request) {
    this.req = req
  }

  GetHeader = (key: string): string | string[] | undefined => {
    return this.req.headers[key]
  }

  GetHeaderOrThrow = (key: string) => {
    const output = this.GetHeader(key)
    if (typeof output === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, `Invalid headers missing ${key}`)
    }
    return output
  }

  GetBody = () => {
    return this.req.body
  }

  GetBodyOrThrow = () => {
    if (typeof this.req.body === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, 'Invalid body')
    }
    return this.req.body
  }

  GetQuery = (key: string): string => {
    return this.req.query[key]
  }

  GetQueryOrThrow = (key: string): string => {
    if (typeof this.req.query[key] === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, `Query parameter name ${key} is required`)
    }
    return this.req.query[key]
  }

  GetParam = (key: string): string => {
    return this.req.params[key]
  }

  GetParamOrThrow = (key: string): string => {
    if (typeof this.req.params[key] === 'undefined') {
      throw newGlobError(GlobErrorType.InputError, `Param parameter name ${key} is required`)
    }
    return this.req.params[key]
  }
}

export type HTTPResponseEncoder<Output, Context extends HygieneBaseContext = HygieneBaseContext> = (ctx: Context, output: Output) => Response
export type HTTPResponseDecoder<Output> = (output: Response<Output>) => Output

export type HTTPRequestDecoder<Input, Context extends HygieneBaseContext = HygieneBaseContext> = (ctx: Context, c: HTTPRequest) => Promise<Input>
export type HTTPRequestEncoder<Input> = (input: Input) => Promise<HTTPRequest>

export type HTTPResolver = (req: express.Request, res: express.Response) => Promise<void>
export function newHTTPResolver<In, Out>(
  endpoint: EndpointFunc<In, Out>,
  decoder: HTTPRequestDecoder<In>,
  encoder: HTTPResponseEncoder<Out>,
  ...middlewares: Middleware[]
) {
  return async (req: express.Request, res: express.Response) => {
    const request = new HTTPRequest(req)
    const ctx: HygieneBaseContext = {
      req: request
    }
    await applyMiddlwares(ctx, middlewares)
    const input = await decoder(ctx, request)
    const output = await endpoint(ctx, input)
    const response = await encoder(ctx, output)

    // Set HTTP Status code from response encoder
    res.status(response.code)
    // Set each header value to response header
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key])
    })

    if (response.headers['Content-Type'] === 'application/json') {
      res.json(response.data)
    } else {
      res.send(response.data)
    }
  }
}
