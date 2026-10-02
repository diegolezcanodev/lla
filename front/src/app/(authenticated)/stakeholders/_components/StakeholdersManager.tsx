"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getStakeholders } from "../../../../services/stakeholders"
import { deleteStakeholder, registrarContactoStakeholder } from "../../../../actions/stakeholder"
import { StakeholderList } from "./StakeholderList"
import { StakeholderFormModal } from "./StakeholderFormModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { StakeholderResponseDTO } from "../../../../types/stakeholder"
import { Plus } from "lucide-react"

interface StakeholdersManagerProps {
  initialData: PaginatedResponse<StakeholderResponseDTO>
}

export function StakeholdersManager({ initialData }: StakeholdersManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<StakeholderResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getStakeholders(page, pageSize, search),
    [],
  )

  const crud = useCrud<StakeholderResponseDTO>({
    fetchFn,
    initialData,
    storageKey: "pageSize_stakeholders",
    routePath: "/stakeholders",
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteStakeholder(deleteTarget.id)
    setDeleting(false)
    if (result.ok) {
      setDeleteTarget(null)
      crud.refreshData(1)
    } else {
      handleActionError(result)
    }
  }

  async function handleRegistrarContacto(s: StakeholderResponseDTO) {
    const result = await registrarContactoStakeholder(s.id)
    if (result.ok) {
      crud.refreshData(crud.page)
    } else {
      handleActionError(result)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight mb-1">
            Actores Clave (CRM)
          </h1>
          <p className="text-sm text-text-secondary">
            Referentes de poder e influencia con seguimiento térmico de relación política
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nuevo actor clave</span>
        </button>
      </div>

      <StakeholderList
        crud={crud}
        onDelete={setDeleteTarget}
        onRegistrarContacto={handleRegistrarContacto}
      />

      {crud.showModal && (
        <StakeholderFormModal
          stakeholder={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar actor clave"
        message={deleteTarget ? `¿Eliminar a ${deleteTarget.nombre} ${deleteTarget.apellido}?` : ""}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
