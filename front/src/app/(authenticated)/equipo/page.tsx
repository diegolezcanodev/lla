import { cookies } from 'next/headers'
import { EquipoManager } from './_components/EquipoManager'
import { getEquipo } from '../../../services/equipo'
import { readPageSize } from '../../../lib/pageSizeCookie'
import type { PaginatedResponse } from '../../../types/pagination'
import type { MiembroEquipoResponseDTO } from '../../../types/equipo'

export default async function EquipoPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, 'pageSize_equipo')
  const initialData = await getEquipo(1, pageSize).catch(
    (): PaginatedResponse<MiembroEquipoResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <EquipoManager initialData={initialData} />
    </div>
  )
}
