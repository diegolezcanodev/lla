import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { StakeholderResponseDTO } from "../types/stakeholder"

export async function getStakeholders(
  page = 1,
  limit = 12,
  search?: string,
  barrioId?: number,
  esAliado?: boolean,
): Promise<PaginatedResponse<StakeholderResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (barrioId) params.set("barrioId", String(barrioId))
  if (esAliado !== undefined) params.set("esAliado", String(esAliado))
  return apiClient<PaginatedResponse<StakeholderResponseDTO>>(`/api/stakeholders?${params}`)
}

export async function getStakeholder(id: number): Promise<StakeholderResponseDTO> {
  return apiClient<StakeholderResponseDTO>(`/api/stakeholders/${id}`)
}
