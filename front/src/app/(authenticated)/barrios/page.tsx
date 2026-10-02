import { cookies } from 'next/headers'
import { BarriosManager } from './_components/BarriosManager'
import { getBarrios } from '../../../services/barrios'
import { readPageSize } from '../../../lib/pageSizeCookie'
import type { PaginatedResponse } from '../../../types/pagination'
import type { BarrioResponseDTO } from '../../../types/barrio'

export default async function BarriosPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, 'pageSize_barrios')
  const initialData = await getBarrios(1, pageSize).catch(
    (): PaginatedResponse<BarrioResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <BarriosManager initialData={initialData} />
    </div>
  )
}
