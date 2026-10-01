import { AsyncLocalStorage } from 'async_hooks'

export type Role = string

export interface AppContext {
  userId: string
  roles: Role[]
}

const als = new AsyncLocalStorage<AppContext>()

export function getAppContext(): AppContext | undefined {
  return als.getStore()
}

export function runWithContext(context: AppContext, fn: () => void): void {
  als.run(context, fn)
}
