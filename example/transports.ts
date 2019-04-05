import { HygieneKernel } from '../lib/kernel'
import {
  TodoEndpoints,
  CreateTodoWithUsernameInput,
  CreateTodoWithUsernameOutput
} from './endpoints'
import {
  newHTTPResolver,
  HTTPRequestDecoder,
  HTTPResponseEncoder,
  newHTTPResponse
} from '../lib/http'
import gql from 'graphql-tag'
import * as joi from 'joi'

export function registerGraphQLTransports(
  core: HygieneKernel,
  endpoints: TodoEndpoints
) {
  const typeDefs = gql`
    type Todo {
      name: String!
      id: String!
      userId: String!
    }
    type Query {
      hello: String!
    }
    type Mutation {
      createTodo(name: String!, username: String!): Todo!
    }
  `
  core.registerGraphQLResolvers(typeDefs, {})
}

export function registerHTTPTransports(
  core: HygieneKernel,
  endpoints: TodoEndpoints
) {
  core.registerHTTPResolver(
    'post',
    '/todo',
    newHTTPResolver(
      endpoints.CreateTodoWithUsername,
      newPostTodoReqDecoder(),
      newPostTodoResEncoder()
    )
  )
}

const PostTodoReqRule = joi.object().keys({
  username: joi
    .string()
    .max(10)
    .required(),
  name: joi
    .string()
    .max(50)
    .required()
})
function newPostTodoReqDecoder(): HTTPRequestDecoder<
  CreateTodoWithUsernameInput
> {
  return async req => {
    const { value, error } = joi.validate<
      Pick<CreateTodoWithUsernameInput, 'username' | 'name'>
    >(req.GetBodyOrThrow(), PostTodoReqRule)
    if (error) {
      throw error
    }
    return {
      username: value.username,
      name: value.name
    }
  }
}

function newPostTodoResEncoder(): HTTPResponseEncoder<
  CreateTodoWithUsernameOutput
> {
  return output => {
    return newHTTPResponse(output).setStatusCode(201)
  }
}
