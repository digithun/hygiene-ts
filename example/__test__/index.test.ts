import { InMemoryTodoRepository, InMemoryUserRepository } from '../repositories'
import { DefaultTodoUseCase } from '../usecase'
import { newTodoEndpoints } from '../endpoints'
import { GraphQLServer } from 'graphql-yoga'
import {
  registerHTTPTransports,
  registerGraphQLTransports
} from '../transports'
import { HygieneKernel } from '../../lib/kernel'
import { createServer, Server } from 'http'
const fetch = require('node-fetch')

describe('Test example', () => {
  let httpServ: Server
  let graphqlServ: Server
  let todos: []
  let users: []
  beforeAll(async () => {
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
        schema: core.graphqlSchema
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
        'Content-Type': 'application/json'
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

  })

  afterAll(async () => {
    return new Promise((resolve, reject) => {
      httpServ.close(() => {
        graphqlServ.close(() => {
          resolve()
        })
      })
    })
  })
})
