import { TodoUseCase } from './usecase'
import { TodoItem } from './entities'
import { EndpointFunc } from '../lib/endpoint';

export type TodoEndpoints = {
  CreateTodoWithUsername: EndpointFunc<CreateTodoWithUsernameInput,CreateTodoWithUsernameOutput>
}
export function newTodoEndpoints(todoUserCase: TodoUseCase): TodoEndpoints {
  return {
    CreateTodoWithUsername: newCreateTodoWithUsernameEndpoint(
      todoUserCase
    )
  }
}

// Define each endpoint Decoder and Encoder
// with mapping with specific single usecase only
export type CreateTodoWithUsernameInput = {
  name: string
  username: string
}
export type CreateTodoWithUsernameOutput = {
  data: TodoItem
}
function newCreateTodoWithUsernameEndpoint(
 todo: TodoUseCase
): EndpointFunc<CreateTodoWithUsernameInput, CreateTodoWithUsernameOutput> {
  return async (ctx, input) => {
    const output = await todo.CreateTodo(input.name, input.username)
    return {
      data: output
    }
  }
}
