import { cookies } from "next/headers"
import { OposicionManager } from "./_components/OposicionManager"
import { getPartidos, getCandidatos, getAllPartidosActivos } from "../../../services/oposicion"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { PartidoResponseDTO, CandidatoResponseDTO } from "../../../types/oposicion"

export default async function OposicionPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_oposicion")
  
  const [partidosData, candidatosData, todosPartidos] = await Promise.all([
    getPartidos(1, pageSize).catch((): PaginatedResponse<PartidoResponseDTO> => ({ data: [], total: 0, page: 1, limit: pageSize, totalPages: 0 })),
    getCandidatos(1, pageSize).catch((): PaginatedResponse<CandidatoResponseDTO> => ({ data: [], total: 0, page: 1, limit: pageSize, totalPages: 0 })),
    getAllPartidosActivos().catch(() => []),
  ])

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <OposicionManager
        initialPartidos={partidosData}
        initialCandidatos={candidatosData}
        todosPartidos={todosPartidos}
      />
    </div>
  )
}
