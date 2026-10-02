import { apiClient } from '../lib/apiClient'
import type { PaginatedResponse } from '../types/pagination'
import type { MiembroEquipoResponseDTO } from '../types/equipo'

export async function getEquipo(
  page = 1,
  limit = 12,
  search?: string,
  tipo?: string,
  barrioId?: number,
): Promise<PaginatedResponse<MiembroEquipoResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  if (tipo && tipo !== 'TODOS') params.set('tipo', tipo)
  if (barrioId) params.set('barrioId', String(barrioId))
  return apiClient<PaginatedResponse<MiembroEquipoResponseDTO>>(`/api/equipo?${params}`)
}

export async function getMiembroEquipo(id: number): Promise<MiembroEquipoResponseDTO> {
  return apiClient<MiembroEquipoResponseDTO>(`/api/equipo/${id}`)
}
