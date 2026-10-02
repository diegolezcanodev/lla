import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { EscuelaResponseDTO } from "../types/escuela"

export async function getEscuelas(
  page = 1,
  limit = 12,
  search?: string,
  barrioId?: number,
  nivel?: string,
): Promise<PaginatedResponse<EscuelaResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (barrioId) params.set("barrioId", String(barrioId))
  if (nivel) params.set("nivel", nivel)
  return apiClient<PaginatedResponse<EscuelaResponseDTO>>(`/api/escuelas?${params}`)
}

export async function getEscuela(id: number): Promise<EscuelaResponseDTO> {
  return apiClient<EscuelaResponseDTO>(`/api/escuelas/${id}`)
}
