'use client'

import { useCallback, useState } from 'react'
import { useCrud } from '../../../../lib/useCrud'
import { handleActionError } from '../../../../lib/handleActionError'
import { getUsuarios } from '../../../../services/usuarios'
import { deleteUsuario } from '../../../../actions/usuario'
import { UsuarioList } from './UsuarioList'
import { UsuarioFormModal } from './UsuarioFormModal'
import { ConfirmModal } from '../../../../components/ConfirmModal'
import type { PaginatedResponse } from '../../../../types/pagination'
import type { UserResponseDTO } from '../../../../types/user'
import { Plus } from 'lucide-react'

export function UsuariosManager({ initialData }: { initialData: PaginatedResponse<UserResponseDTO> }) {
  const [deleteTarget, setDeleteTarget] = useState<UserResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getUsuarios(page, pageSize, search),
    [],
  )

  const crud = useCrud<UserResponseDTO>({
    fetchFn,
    initialData,
    storageKey: 'pageSize_usuarios',
    routePath: '/usuarios',
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteUsuario(deleteTarget.id)
    setDeleting(false)
    if (result.ok) {
      setDeleteTarget(null)
      crud.refreshData(1)
    } else {
      handleActionError(result)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight mb-1">
            Usuarios
          </h1>
          <p className="text-sm text-text-secondary">
            Administrá las cuentas de acceso y roles del sistema LLA
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Crear usuario</span>
        </button>
      </div>

      <UsuarioList crud={crud} onDelete={setDeleteTarget} />

      {crud.showModal && (
        <UsuarioFormModal
          usuario={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={deleteTarget ? `¿Eliminar el usuario ${deleteTarget.email}? Esta acción no se puede deshacer.` : ''}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
