import { cookies } from "next/headers"
import { TareasManager } from "./_components/TareasManager"
import { getTareas } from "../../../services/tareas"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { TareaResponseDTO } from "../../../types/tarea"

export default async function TareasPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_tareas")
  const initialData = await getTareas(1, pageSize).catch(
    (): PaginatedResponse<TareaResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <TareasManager initialData={initialData} />
    </div>
  )
}
