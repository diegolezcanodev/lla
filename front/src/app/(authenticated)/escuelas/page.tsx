import { cookies } from "next/headers"
import { EscuelasManager } from "./_components/EscuelasManager"
import { getEscuelas } from "../../../services/escuelas"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { EscuelaResponseDTO } from "../../../types/escuela"

export default async function EscuelasPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_escuelas")
  const initialData = await getEscuelas(1, pageSize).catch(
    (): PaginatedResponse<EscuelaResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <EscuelasManager initialData={initialData} />
    </div>
  )
}
