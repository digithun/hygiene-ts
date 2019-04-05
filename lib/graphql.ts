import { EndpointFunc, HygieneBaseContext } from './endpoint'
import { Middleware, applyMiddlwares } from './middlewares'

export class GraphQLRequest<Root = any, Args = any, Context extends HygieneBaseContext = HygieneBaseContext> {
  root: Root
  args: Args
  context: Context
  constructor(root: Root, args: Args, context) {
    this.root = root
    this.args = args
    this.context = context
  }
}

export class GraphQLResponse<T = any> {
  data: T
  constructor(data: T) {
    this.data = data
  }
}

export type GraphQLRequestDecoder<Input, R, A, C extends HygieneBaseContext> = (request: GraphQLRequest<R, A, C>) => Promise<Input>
export type GraphQLResponseEncoder<Output> = (output: Output) => Promise<GraphQLResponse>

export function newGraphQLResolver<Input, Output, Root = any, Args = any, Context extends HygieneBaseContext = HygieneBaseContext>(
  endpoint: EndpointFunc,
  decoder: GraphQLRequestDecoder<Input, Root, Args, Context>,
  encoder: GraphQLResponseEncoder<Output>,
  ...middlewares: Middleware[]
) {
  return async (root, args, ctx) => {
    const request = new GraphQLRequest<any, any, Context>(root, args, ctx)
    await applyMiddlwares(request.context, middlewares)
    const input = await decoder(request)
    const output = await endpoint(request.context, input)
    const response = await encoder(output)
    return response.data
  }
}
