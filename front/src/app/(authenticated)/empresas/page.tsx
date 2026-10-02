import { cookies } from "next/headers"
import { EmpresasManager } from "./_components/EmpresasManager"
import { getEmpresas } from "../../../services/empresas"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { EmpresaResponseDTO } from "../../../types/empresa"

export default async function EmpresasPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_empresas")
  const initialData = await getEmpresas(1, pageSize).catch(
    (): PaginatedResponse<EmpresaResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <EmpresasManager initialData={initialData} />
    </div>
  )
}
