import { InMemoryTodoRepository, InMemoryUserRepository } from './repositories'
import { DefaultTodoUseCase } from './usecase'
import { newTodoEndpoints } from './endpoints'
import { HygieneKernel } from '../lib/kernel'
import { registerGraphQLTransports, registerHTTPTransports } from './transports'
import { createServer } from 'https';
import { GraphQLServer } from 'graphql-yoga';

async function bootstrap() {
  const todos = []
  const users = []
  const todoRepository = new InMemoryTodoRepository(todos)
  const userRepository = new InMemoryUserRepository(users)
  const todoUseCase = new DefaultTodoUseCase(userRepository, todoRepository)
  const appEndpoints = newTodoEndpoints(todoUseCase)

  const core = new HygieneKernel()

  registerHTTPTransports(core, appEndpoints)
  registerGraphQLTransports(core, appEndpoints)
  createServer(core.httpServ).listen(3000, () => {
    console.log('Server is ready')
  })
  const yoga = new GraphQLServer({
    schema: core.graphqlSchema,
    context: (params) => {
      return params.request
    }
  })
  await yoga.start({
    port: 3001
  })
}

bootstrap()
