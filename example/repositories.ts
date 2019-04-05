import { TodoItem, User } from './entities'
import { v4 } from 'uuid'

export interface UserRepository {
  CreateUser(name: string): Promise<User>
  GetUserByName(name: string): Promise<User | undefined>
}

export class InMemoryUserRepository implements UserRepository {
  async GetUserByName(name: string): Promise<User | undefined> {
    return this.data.find(user => user.name === name)
  }
  async CreateUser(name: string): Promise<User> {
    this.data.push({
      id: v4(),
      name
    })
    return this.data[this.data.length - 1]
  }
  data: User[]
  constructor(data: User[]) {
    this.data = data
  }
}

export interface TodoRepository {
  CreateTodo(name: string, userId: string): Promise<TodoItem>
  UpdateTodo(
    id: string,
    name: string,
    checked: boolean,
    userId: string
  ): Promise<TodoItem>
  GetTodo(userId: string): Promise<TodoItem>
  DeleteTodo(id: string): Promise<void>
}

export class InMemoryTodoRepository implements TodoRepository {
  async CreateTodo(name: string, userId: string): Promise<TodoItem> {
    this.data.push({
      name,
      checked: false,
      id: v4(),
      userId
    })

    return this.data[this.data.length - 1]
  }
  UpdateTodo(
    id: string,
    name: string,
    checked: boolean,
    userId: string
  ): Promise<TodoItem> {
    throw new Error('Method not implemented.')
  }
  GetTodo(userId: string): Promise<TodoItem> {
    throw new Error('Method not implemented.')
  }
  DeleteTodo(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  data: TodoItem[]
  constructor(dataStorage: TodoItem[]) {
    this.data = dataStorage
  }
}
