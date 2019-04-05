import * as joi from 'joi'
import gql from 'graphql-tag'
import { HygieneKernel } from '../lib/kernel'
import { TodoEndpoints, CreateTodoWithUsernameInput, CreateTodoWithUsernameOutput } from './endpoints'
import { newHTTPResolver, HTTPRequestDecoder, HTTPResponseEncoder, newHTTPResponse } from '../lib/http'
import { newGraphQLResolver, GraphQLRequestDecoder, GraphQLResponseEncoder } from '../lib/graphql'

// GraphQL Transport Layer with Decoder and Encoder of each endpoints
export function registerGraphQLTransports(core: HygieneKernel, endpoints: TodoEndpoints) {
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
  core.registerGraphQLResolvers(typeDefs, {
    Mutation: {
      createTodo: newGraphQLResolver(endpoints.CreateTodoWithUsername, newGraphQLCreateTodoReqDecoder(), newGraphQLCreateTodoResEncoder())
    }
  })
}

function newGraphQLCreateTodoReqDecoder(): GraphQLRequestDecoder<CreateTodoWithUsernameInput, null, { name: string; username: string }> {
  return async function(ctx, request) {
    return {
      name: request.args.name,
      username: request.args.username
    }
  }
}

function newGraphQLCreateTodoResEncoder(): GraphQLResponseEncoder<CreateTodoWithUsernameOutput> {
  return async ( ctx, output ) => {
    return {
      data: output.data
    }
  }
}



// Restful HTTP service with decoder and encoder of each endpoints
export function registerHTTPTransports(core: HygieneKernel, endpoints: TodoEndpoints) {
  core.registerHTTPResolver(
    'post',
    '/todo',
    newHTTPResolver(endpoints.CreateTodoWithUsername, newHTTPPostTodoReqDecoder(), newHTTPPostTodoResEncoder())
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
function newHTTPPostTodoReqDecoder(): HTTPRequestDecoder<CreateTodoWithUsernameInput> {
  return async ( ctx, req ) => {
    const { value, error } = joi.validate<Pick<CreateTodoWithUsernameInput, 'username' | 'name'>>(req.GetBodyOrThrow(), PostTodoReqRule)
    if (error) {
      throw error
    }
    return {
      username: value.username,
      name: value.name
    }
  }
}

function newHTTPPostTodoResEncoder(): HTTPResponseEncoder<CreateTodoWithUsernameOutput> {
  return ( ctx, output ) => {
    return newHTTPResponse(output).setStatusCode(201)
  }
}
