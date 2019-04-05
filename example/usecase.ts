import { TodoItem } from './entities'
import { UserRepository, TodoRepository } from './repositories'

export interface TodoUseCase {
  CreateTodo(name: string, username: string): Promise<TodoItem>
}

export class DefaultTodoUseCase implements TodoUseCase {

  async CreateTodo(name: string, username: string): Promise<TodoItem> {

    // Will create user if not exists
    let user = await this.userRepository.GetUserByName(username)
    if (typeof user === 'undefined') {
      user = await this.userRepository.CreateUser(username)
    }

    // Create todo from user
    const todo = await this.todoRepository.CreateTodo(name,user.id)
    return todo

  }

  userRepository: UserRepository
  todoRepository: TodoRepository
  constructor(userRepository: UserRepository, todoRepository: TodoRepository) {
    this.userRepository = userRepository
    this.todoRepository = todoRepository
  }
}
