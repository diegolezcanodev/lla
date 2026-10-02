'use client'

import { useCallback, useState } from 'react'
import { useCrud } from '../../../../lib/useCrud'
import { handleActionError } from '../../../../lib/handleActionError'
import { getEquipo } from '../../../../services/equipo'
import { deleteMiembroEquipo } from '../../../../actions/equipo'
import { EquipoList } from './EquipoList'
import { EquipoFormModal } from './EquipoFormModal'
import { ConfirmModal } from '../../../../components/ConfirmModal'
import type { PaginatedResponse } from '../../../../types/pagination'
import type { MiembroEquipoResponseDTO, TipoMiembro } from '../../../../types/equipo'
import { Plus, Users, Filter } from 'lucide-react'

interface EquipoManagerProps {
  initialData: PaginatedResponse<MiembroEquipoResponseDTO>
}

const TIPO_TABS: { key: string; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'EQUIPO', label: 'Equipo' },
  { key: 'ESTRATEGIA', label: 'Estrategia' },
  { key: 'FISCAL', label: 'Fiscales' },
  { key: 'VECINO', label: 'Vecinos' },
]

export function EquipoManager({ initialData }: EquipoManagerProps) {
  const [selectedTipo, setSelectedTipo] = useState<string>('TODOS')
  const [deleteTarget, setDeleteTarget] = useState<MiembroEquipoResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) =>
      getEquipo(page, pageSize, search, selectedTipo),
    [selectedTipo],
  )

  const crud = useCrud<MiembroEquipoResponseDTO>({
    fetchFn,
    initialData,
    storageKey: 'pageSize_equipo',
    routePath: '/equipo',
  })

  function handleSelectTipo(tipoKey: string) {
    setSelectedTipo(tipoKey)
    // Fetch directly with new tipo
    getEquipo(1, crud.pageSize, crud.search, tipoKey)
      .then((res) => {
        // useCrud state update via refreshData or custom fetch
        crud.refreshData(1)
      })
      .catch(() => {})
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteMiembroEquipo(deleteTarget.id)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight mb-1">
            Equipo y Territorio
          </h1>
          <p className="text-sm text-text-secondary">
            Administrá los miembros del equipo, planificadores, fiscales de mesa y contactos barriales
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nuevo miembro</span>
        </button>
      </div>

      {/* Tabs por Tipo */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        {TIPO_TABS.map((tab) => {
          const isActive = selectedTipo === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => handleSelectTipo(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tabla de Miembros */}
      <EquipoList crud={crud} onDelete={setDeleteTarget} />

      {/* Modal de Creación / Edición */}
      {crud.showModal && (
        <EquipoFormModal
          miembro={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      {/* Modal de Confirmación de Baja */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar miembro"
        message={
          deleteTarget
            ? `¿Eliminar a ${deleteTarget.nombre} ${deleteTarget.apellido} (${deleteTarget.barrioNombre || 'Sin barrio'})? Si posee un usuario vinculado, su acceso también quedará revocado.`
            : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
