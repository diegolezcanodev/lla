"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { PartidoResponseDTO } from "../../../../types/oposicion"
import { Pencil, Trash2, Flag, Users } from "lucide-react"

interface PartidoListProps {
  crud: CrudState<PartidoResponseDTO>
  onDelete: (p: PartidoResponseDTO) => void
}

export function PartidoList({ crud, onDelete }: PartidoListProps) {
  const columns: DataTableColumn<PartidoResponseDTO>[] = useMemo(
    () => [
      {
        key: "nombre",
        header: "Partido o Frente",
        render: (p) => (
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border"
              style={{ backgroundColor: p.color || "#6B7280" }}
            />
            <div>
              <span className="font-semibold text-text-primary text-sm">{p.nombre}</span>
              {p.sigla && (
                <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-bg-secondary text-text-tertiary">
                  {p.sigla}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "referente",
        header: "Referente Principal",
        render: (p) => (
          <span className="text-sm text-text-secondary">
            {p.referenteNombre || <span className="text-text-tertiary italic">Sin referente asignado</span>}
          </span>
        ),
      },
      {
        key: "candidatos",
        header: "Candidatos registrados",
        render: (p) => (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
            <Users size={14} className="text-text-tertiary" />
            <span>{p.candidatosCount} perfiles</span>
          </div>
        ),
      },
      {
        key: "observaciones",
        header: "Notas estratégicas",
        render: (p) => (
          <p className="text-xs text-text-secondary line-clamp-1 max-w-xs">
            {p.observaciones || <span className="text-text-tertiary italic">Sin notas</span>}
          </p>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        render: (p) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              p.activo ? "bg-success-light text-success" : "bg-bg-secondary text-text-tertiary"
            }`}
          >
            {p.activo ? "Activo" : "Inactivo"}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={crud.data}
      keyExtractor={(p) => p.id}
      loading={crud.loading}
      emptyMessage="No hay partidos registrados aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => crud.handleEdit(p)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar partido"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(p)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar partido"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
