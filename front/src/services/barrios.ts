import { apiClient } from '../lib/apiClient'
import type { PaginatedResponse } from '../types/pagination'
import type { BarrioResponseDTO } from '../types/barrio'

export async function getBarrios(
  page = 1,
  limit = 12,
  search?: string,
): Promise<PaginatedResponse<BarrioResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  return apiClient<PaginatedResponse<BarrioResponseDTO>>(`/api/barrios?${params}`)
}

export async function getAllBarriosActivos(): Promise<BarrioResponseDTO[]> {
  return apiClient<BarrioResponseDTO[]>('/api/barrios/activos')
}

export async function getBarrio(id: number): Promise<BarrioResponseDTO> {
  return apiClient<BarrioResponseDTO>(`/api/barrios/${id}`)
}
