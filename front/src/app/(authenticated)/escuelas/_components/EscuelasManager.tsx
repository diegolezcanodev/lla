"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getEscuelas } from "../../../../services/escuelas"
import { deleteEscuela } from "../../../../actions/escuela"
import { EscuelaList } from "./EscuelaList"
import { EscuelaFormModal } from "./EscuelaFormModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { EscuelaResponseDTO } from "../../../../types/escuela"
import { Plus } from "lucide-react"

interface EscuelasManagerProps {
  initialData: PaginatedResponse<EscuelaResponseDTO>
}

export function EscuelasManager({ initialData }: EscuelasManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<EscuelaResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getEscuelas(page, pageSize, search),
    [],
  )

  const crud = useCrud<EscuelaResponseDTO>({
    fetchFn,
    initialData,
    storageKey: "pageSize_escuelas",
    routePath: "/escuelas",
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteEscuela(deleteTarget.id)
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
            Establecimientos Educativos
          </h1>
          <p className="text-sm text-text-secondary">
            Escuelas, colegios e institutos educativos de la ciudad por nivel y territorio
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nueva escuela</span>
        </button>
      </div>

      <EscuelaList crud={crud} onDelete={setDeleteTarget} />

      {crud.showModal && (
        <EscuelaFormModal
          escuela={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar escuela"
        message={deleteTarget ? `¿Seguro que deseás eliminar a ${deleteTarget.nombre}?` : ""}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
