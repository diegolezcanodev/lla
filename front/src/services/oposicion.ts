import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { PartidoResponseDTO, CandidatoResponseDTO } from "../types/oposicion"

export async function getPartidos(
  page = 1,
  limit = 12,
  search?: string,
): Promise<PaginatedResponse<PartidoResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  return apiClient<PaginatedResponse<PartidoResponseDTO>>(`/api/partidos?${params}`)
}

export async function getAllPartidosActivos(): Promise<PartidoResponseDTO[]> {
  return apiClient<PartidoResponseDTO[]>("/api/partidos/activos")
}

export async function getCandidatos(
  page = 1,
  limit = 12,
  search?: string,
  partidoId?: number,
  nivelAmenaza?: string,
): Promise<PaginatedResponse<CandidatoResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (partidoId) params.set("partidoId", String(partidoId))
  if (nivelAmenaza) params.set("nivelAmenaza", nivelAmenaza)
  return apiClient<PaginatedResponse<CandidatoResponseDTO>>(`/api/candidatos?${params}`)
}
