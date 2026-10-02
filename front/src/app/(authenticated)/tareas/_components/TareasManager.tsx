"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getTareas } from "../../../../services/tareas"
import { deleteTarea } from "../../../../actions/tarea"
import { TareaList } from "./TareaList"
import { TareaFormModal } from "./TareaFormModal"
import { TareaDetalleModal } from "./TareaDetalleModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { TareaResponseDTO } from "../../../../types/tarea"
import { Plus } from "lucide-react"

interface TareasManagerProps {
  initialData: PaginatedResponse<TareaResponseDTO>
}

export function TareasManager({ initialData }: TareasManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<TareaResponseDTO | null>(null)
  const [detalleTarget, setDetalleTarget] = useState<TareaResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getTareas(page, pageSize, search),
    [],
  )

  const crud = useCrud<TareaResponseDTO>({
    fetchFn,
    initialData,
    storageKey: "pageSize_tareas",
    routePath: "/tareas",
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteTarea(deleteTarget.id)
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
            Tareas & Tickets de Campaña
          </h1>
          <p className="text-sm text-text-secondary">
            Seguimiento de objetivos, actividades del equipo y comentarios en tiempo real
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nueva tarea</span>
        </button>
      </div>

      <TareaList
        crud={crud}
        onDelete={setDeleteTarget}
        onVerDetalle={setDetalleTarget}
      />

      {crud.showModal && (
        <TareaFormModal
          tarea={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      {detalleTarget && (
        <TareaDetalleModal
          tarea={detalleTarget}
          onClose={() => setDetalleTarget(null)}
          onComentarioAgregado={() => {
            crud.refreshData(crud.page)
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar tarea"
        message={deleteTarget ? `¿Eliminar la tarea "${deleteTarget.titulo}"?` : ""}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
