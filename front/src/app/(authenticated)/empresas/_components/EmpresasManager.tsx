"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getEmpresas } from "../../../../services/empresas"
import { deleteEmpresa } from "../../../../actions/empresa"
import { EmpresaList } from "./EmpresaList"
import { EmpresaFormModal } from "./EmpresaFormModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { EmpresaResponseDTO } from "../../../../types/empresa"
import { Plus } from "lucide-react"

interface EmpresasManagerProps {
  initialData: PaginatedResponse<EmpresaResponseDTO>
}

export function EmpresasManager({ initialData }: EmpresasManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<EmpresaResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFn = useCallback(
    (page: number, pageSize: number, search?: string) => getEmpresas(page, pageSize, search),
    [],
  )

  const crud = useCrud<EmpresaResponseDTO>({
    fetchFn,
    initialData,
    storageKey: "pageSize_empresas",
    routePath: "/empresas",
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteEmpresa(deleteTarget.id)
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
            Empresas y Comercios
          </h1>
          <p className="text-sm text-text-secondary">
            Ecosistema empresarial de la ciudad, rubros y contactos de vinculación
          </p>
        </div>
        <button
          onClick={crud.handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          <span>Nueva empresa</span>
        </button>
      </div>

      <EmpresaList crud={crud} onDelete={setDeleteTarget} />

      {crud.showModal && (
        <EmpresaFormModal
          empresa={crud.selectedItem ?? undefined}
          onClose={crud.handleClose}
          onSuccess={() => crud.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar empresa"
        message={deleteTarget ? `¿Seguro que deseás eliminar a ${deleteTarget.nombre}?` : ""}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
