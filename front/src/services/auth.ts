import { apiClient, ApiError } from '../lib/apiClient'
import type { UserResponseDTO } from '../types/user'

export interface LoginResult {
  user: UserResponseDTO
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  return apiClient<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: identifier, email: identifier, password }),
  })
}

export async function logout(): Promise<void> {
  await apiClient<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  })
}

export async function getMe(): Promise<LoginResult | null> {
  try {
    return await apiClient<LoginResult>('/api/auth/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}
