"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getReclamos } from "../../../../services/reclamos"
import { deleteReclamo } from "../../../../actions/reclamo"
import { ReclamoList } from "./ReclamoList"
import { ReclamoFormModal } from "./ReclamoFormModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { ReclamoResponseDTO } from "../../../../types/reclamo"
import { Plus } from "lucide-react"

interface ReclamosManagerProps {
  initialData: PaginatedResponse<ReclamoResponseDTO>
}

export function ReclamosManager({ initialData }: ReclamosManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<ReclamoResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getReclamos(page, pageSize, search),
    [],
  )

  const crud = useCrud<ReclamoResponseDTO>({
    fetchFn,
    initialData,
    storageKey: "pageSize_reclamos",
    routePath: "/reclamos",
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteReclamo(deleteTarget.id)
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
            Reclamos Vecinales
          </h1>
          <p className="text-sm text-text-secondary">
            Gestión de quejas, pedidos territoriales y respuestas a los vecinos de la ciudad
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nuevo reclamo</span>
        </button>
      </div>

      <ReclamoList crud={crud} onDelete={setDeleteTarget} />

      {crud.showModal && (
        <ReclamoFormModal
          reclamo={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar reclamo"
        message={deleteTarget ? `¿Eliminar el reclamo de ${deleteTarget.vecino}?` : ""}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
