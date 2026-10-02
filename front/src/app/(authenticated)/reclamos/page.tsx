import { cookies } from "next/headers"
import { ReclamosManager } from "./_components/ReclamosManager"
import { getReclamos } from "../../../services/reclamos"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { ReclamoResponseDTO } from "../../../types/reclamo"

export default async function ReclamosPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_reclamos")
  const initialData = await getReclamos(1, pageSize).catch(
    (): PaginatedResponse<ReclamoResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <ReclamosManager initialData={initialData} />
    </div>
  )
}
