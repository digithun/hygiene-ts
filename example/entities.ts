
export interface User {
  name: string
  id: string
}

export interface TodoItem {
  name: string
  id: string
  checked: boolean
  userId: string
  user?: User
}