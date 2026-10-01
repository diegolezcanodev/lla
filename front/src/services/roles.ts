import { apiClient } from '../lib/apiClient'
import type { RolResponseDTO } from '../types/rol'

export async function getRoles(): Promise<RolResponseDTO[]> {
  return apiClient<RolResponseDTO[]>('/api/roles')
}
