import { EndpointFunc, HygieneBaseContext } from './endpoint'
import { Middleware, applyMiddlwares } from './middleware'
import { newGlobError, GlobErrorType } from './errors';
import { HTTPRequest } from './http';

export class GraphQLRequest<Root = any, Args = any> {
  root: Root
  args: Args
  constructor(root: Root, args: Args) {
    this.root = root
    this.args = args
  }
}

export class GraphQLResponse<T = any> {
  data: T
  constructor(data: T) {
    this.data = data
  }
}

export type GraphQLRequestDecoder<Input, R = any, A = any, C extends HygieneBaseContext = HygieneBaseContext> = (
  ctx: C,
  request: GraphQLRequest<R, A>
) => Promise<Input>
export type GraphQLResponseEncoder<Output, C extends HygieneBaseContext = HygieneBaseContext> = (ctx: C, output: Output) => Promise<GraphQLResponse>

export function newGraphQLResolver<Input, Output>(
  endpoint: EndpointFunc,
  decoder: GraphQLRequestDecoder<Input, any, any, HygieneBaseContext>,
  encoder: GraphQLResponseEncoder<Output>,
  ...middlewares: Middleware[]
) {
  return async (root, args, graphQLContext) => {

    // validate if graphQLContext is IncomingMessage
    if (typeof graphQLContext.method === 'undefined') {
      throw newGlobError(GlobErrorType.InternalError, "Cannot parse request incoming message from GraphQL context, please check your GraphQL engine and ensure that it parse request object as a context")
    }

    const ctx: HygieneBaseContext = {
      req: new HTTPRequest(graphQLContext)
    }

    const request = new GraphQLRequest<any, any>(root, args)
    await applyMiddlwares(ctx, middlewares)
    const input = await decoder(ctx, request)
    const output = await endpoint(ctx, input)
    const response = await encoder(ctx, output)

    return response.data
  }
}
