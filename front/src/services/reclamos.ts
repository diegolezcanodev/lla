import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { ReclamoResponseDTO } from "../types/reclamo"

export async function getReclamos(
  page = 1,
  limit = 12,
  search?: string,
  barrioId?: number,
  categoria?: string,
  estado?: string,
  prioridad?: string,
): Promise<PaginatedResponse<ReclamoResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (barrioId) params.set("barrioId", String(barrioId))
  if (categoria) params.set("categoria", categoria)
  if (estado) params.set("estado", estado)
  if (prioridad) params.set("prioridad", prioridad)
  return apiClient<PaginatedResponse<ReclamoResponseDTO>>(`/api/reclamos?${params}`)
}

export async function getReclamo(id: number): Promise<ReclamoResponseDTO> {
  return apiClient<ReclamoResponseDTO>(`/api/reclamos/${id}`)
}
