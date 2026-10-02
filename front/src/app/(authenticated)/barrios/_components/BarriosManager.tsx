'use client'

import { useCallback, useState } from 'react'
import { useCrud } from '../../../../lib/useCrud'
import { handleActionError } from '../../../../lib/handleActionError'
import { getBarrios } from '../../../../services/barrios'
import { deleteBarrio } from '../../../../actions/barrio'
import { BarrioList } from './BarrioList'
import { BarrioFormModal } from './BarrioFormModal'
import { ConfirmModal } from '../../../../components/ConfirmModal'
import type { PaginatedResponse } from '../../../../types/pagination'
import type { BarrioResponseDTO } from '../../../../types/barrio'
import { Plus } from 'lucide-react'

interface BarriosManagerProps {
  initialData: PaginatedResponse<BarrioResponseDTO>
}

export function BarriosManager({ initialData }: BarriosManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<BarrioResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getBarrios(page, pageSize, search),
    [],
  )

  const crud = useCrud<BarrioResponseDTO>({
    fetchFn,
    initialData,
    storageKey: 'pageSize_barrios',
    routePath: '/barrios',
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteBarrio(deleteTarget.id)
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
            Barrios y Zonas
          </h1>
          <p className="text-sm text-text-secondary">
            Administrá los barrios disponibles para la asignación territorial del equipo
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nuevo barrio</span>
        </button>
      </div>

      <BarrioList crud={crud} onDelete={setDeleteTarget} />

      {crud.showModal && (
        <BarrioFormModal
          barrio={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar barrio"
        message={
          deleteTarget
            ? `¿Eliminar el barrio ${deleteTarget.nombre}? Si hay miembros asociados, se desvinculará este barrio.`
            : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
