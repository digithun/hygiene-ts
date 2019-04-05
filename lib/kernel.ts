import * as express from 'express'
import { HTTPResolver } from './http'
import { IResolvers, ITypeDefinitions, makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { RequestListener } from 'http';
import bodyParser = require('body-parser');

export class HygieneKernel {
  httpServ: RequestListener 
  graphqlSchema?: GraphQLSchema

  constructor() {

    // setup express instance with bodyparser
    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded())

    this.httpServ = app
  }

  registerHTTPResolver(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    resolver: HTTPResolver
  ) {
    this.httpServ[method](path, resolver)
  }

  registerGraphQLResolvers(typeDefs: ITypeDefinitions, resolvers: IResolvers) {
    this.graphqlSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
    })
  }

}
