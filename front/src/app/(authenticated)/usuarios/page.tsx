import { cookies } from 'next/headers'
import { UsuariosManager } from './_components/UsuariosManager'
import { getUsuarios } from '../../../services/usuarios'
import { readPageSize } from '../../../lib/pageSizeCookie'
import type { PaginatedResponse } from '../../../types/pagination'
import type { UserResponseDTO } from '../../../types/user'

export default async function UsuariosPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, 'pageSize_usuarios')
  const initialData = await getUsuarios(1, pageSize).catch((): PaginatedResponse<UserResponseDTO> => ({
    data: [], total: 0, page: 1, limit: pageSize, totalPages: 0,
  }))

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <UsuariosManager initialData={initialData} />
    </div>
  )
}
