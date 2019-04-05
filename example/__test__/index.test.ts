import { InMemoryTodoRepository, InMemoryUserRepository } from '../repositories'
import { DefaultTodoUseCase } from '../usecase'
import { newTodoEndpoints } from '../endpoints'
import { GraphQLServer } from 'graphql-yoga'
import { registerHTTPTransports, registerGraphQLTransports } from '../transports'
import { HygieneKernel } from '../../lib/kernel'
import { createServer, Server } from 'http'
import gql from 'graphql-tag'
const fetch = require('node-fetch')

describe('Test example', () => {
  let httpServ: Server
  let graphqlServ: Server
  let todos: []
  let users: []
  beforeEach(async () => {
    todos = []
    users = []
    const todoRepository = new InMemoryTodoRepository(todos)
    const userRepository = new InMemoryUserRepository(users)
    const todoUseCase = new DefaultTodoUseCase(userRepository, todoRepository)
    const appEndpoints = newTodoEndpoints(todoUseCase)

    const core = new HygieneKernel()

    registerHTTPTransports(core, appEndpoints)
    registerGraphQLTransports(core, appEndpoints)

    return new Promise(async (resolve, reject) => {
      httpServ = createServer(core.httpServ).listen(3000, () => {
        console.log('Server is ready')
        resolve()
      })
      const yoga = new GraphQLServer({
        schema: core.graphqlSchema,
        context: params => {
          return params.request
        }
      })
      graphqlServ = await yoga.start({
        port: 3001
      })
    })
  })

  it('Should HTTP Post /todo create todo create new todo and user if not exists', async () => {
    const resp = await fetch('http://localhost:3000/todo', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        name: 'Have a dinner'
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'REST_KEY'
      }
    })

    expect(resp.status).toEqual(201)

    const body = await resp.json()
    expect(body.data.name).toEqual('Have a dinner')
    expect(typeof body.data.userId).toEqual('string')

    expect(users).toHaveLength(1)
    expect(todos).toHaveLength(1)
  })
  it('should GraphQL Create todo create new todo and user if not exists', async () => {
    const resp = await fetch('http://localhost:3001/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'GRAPHQL_KEY'
      },
      body: JSON.stringify({
        query: gql`
          mutation {
            createTodo(name: "Sleep for 8 hrs", username: "Dylan") {
              id
              name
            }
          }
        `
      })
    })
    expect(resp.status).toEqual(200)
    const body = await resp.json()
    expect(body.data.createTodo.name).toEqual('Sleep for 8 hrs')

    expect(users).toHaveLength(1)
    expect(todos).toHaveLength(1)
  })

  afterEach(async () => {
    return new Promise((resolve, reject) => {
      httpServ.close(() => {
        graphqlServ.close(() => {
          resolve()
        })
      })
    })
  })
})
