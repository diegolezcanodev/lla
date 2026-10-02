import { apiClient } from "../lib/apiClient"
import type { PaginatedResponse } from "../types/pagination"
import type { EmpresaResponseDTO } from "../types/empresa"

export async function getEmpresas(
  page = 1,
  limit = 12,
  search?: string,
  barrioId?: number,
  tamano?: string,
): Promise<PaginatedResponse<EmpresaResponseDTO>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  if (barrioId) params.set("barrioId", String(barrioId))
  if (tamano) params.set("tamano", tamano)
  return apiClient<PaginatedResponse<EmpresaResponseDTO>>(`/api/empresas?${params}`)
}

export async function getEmpresa(id: number): Promise<EmpresaResponseDTO> {
  return apiClient<EmpresaResponseDTO>(`/api/empresas/${id}`)
}
