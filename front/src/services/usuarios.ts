import { apiClient } from '../lib/apiClient'
import type { PaginatedResponse } from '../types/pagination'
import type { UserResponseDTO } from '../types/user'

export async function getUsuarios(
  page = 1,
  limit = 12,
  search?: string,
): Promise<PaginatedResponse<UserResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  return apiClient<PaginatedResponse<UserResponseDTO>>(`/api/users?${params}`)
}

export async function getUsuario(id: number): Promise<UserResponseDTO> {
  return apiClient<UserResponseDTO>(`/api/users/${id}`)
}
