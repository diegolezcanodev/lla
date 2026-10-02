import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { TareaResponseDTO } from "../types/tarea"

export async function getTareas(
  page = 1,
  limit = 12,
  search?: string,
  estado?: string,
  prioridad?: string,
  asignadoAId?: number,
  barrioId?: number,
): Promise<PaginatedResponse<TareaResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (estado) params.set("estado", estado)
  if (prioridad) params.set("prioridad", prioridad)
  if (asignadoAId) params.set("asignadoAId", String(asignadoAId))
  if (barrioId) params.set("barrioId", String(barrioId))
  return apiClient<PaginatedResponse<TareaResponseDTO>>(`/api/tareas?${params}`)
}

export async function getTarea(id: number): Promise<TareaResponseDTO> {
  return apiClient<TareaResponseDTO>(`/api/tareas/${id}`)
}
