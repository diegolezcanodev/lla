"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { ReclamoResponseDTO, EstadoReclamo, PrioridadReclamo } from "../../../../types/reclamo"
import { Pencil, Trash2, MapPin, User, MessageSquare } from "lucide-react"

interface ReclamoListProps {
  crud: CrudState<ReclamoResponseDTO>
  onDelete: (r: ReclamoResponseDTO) => void
}

function EstadoBadge({ estado }: { estado: EstadoReclamo }) {
  switch (estado) {
    case "PENDIENTE":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning border border-warning">Pendiente</span>
    case "EN_PROCESO":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-info-light text-info border border-info">En proceso</span>
    case "RESUELTO":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success border border-success">Resuelto</span>
    case "RECHAZADO":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger border border-danger">Rechazado</span>
  }
}

function PrioridadBadge({ prio }: { prio: PrioridadReclamo }) {
  switch (prio) {
    case "ALTA":
      return <span className="text-xs font-bold text-danger">Alta</span>
    case "MEDIA":
      return <span className="text-xs font-medium text-warning">Media</span>
    case "BAJA":
      return <span className="text-xs text-text-tertiary">Baja</span>
  }
}

export function ReclamoList({ crud, onDelete }: ReclamoListProps) {
  const columns: DataTableColumn<ReclamoResponseDTO>[] = useMemo(
    () => [
      {
        key: "vecino",
        header: "Vecino / Solicitante",
        render: (r) => (
          <div>
            <div className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
              <User size={14} className="text-text-tertiary shrink-0" />
              <span>{r.vecino}</span>
            </div>
            {r.telefono && <p className="text-xs text-text-tertiary ml-5">{r.telefono}</p>}
          </div>
        ),
      },
      {
        key: "categoria",
        header: "Categoría & Prioridad",
        render: (r) => (
          <div>
            <span className="inline-block px-2 py-0.5 rounded bg-bg-secondary text-text-secondary text-xs font-semibold">
              {r.categoria}
            </span>
            <div className="mt-1">
              <PrioridadBadge prio={r.prioridad} />
            </div>
          </div>
        ),
      },
      {
        key: "descripcion",
        header: "Reclamo & Dirección",
        render: (r) => (
          <div className="max-w-md">
            <p className="text-sm font-semibold text-text-primary line-clamp-1">{r.titulo}</p>
            <p className="text-xs text-text-secondary line-clamp-2 mt-0.5 whitespace-pre-line">{r.descripcion}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-text-tertiary">
              {r.direccion && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {r.direccion}
                </span>
              )}
              {r.barrioNombre && (
                <span className="px-1.5 py-0.5 rounded bg-primary-light text-primary font-medium">
                  {r.barrioNombre}
                </span>
              )}
            </div>
            {r.respuesta && (
              <div className="mt-1 flex items-center gap-1 text-xs text-success">
                <MessageSquare size={11} />
                <span className="line-clamp-1 italic">Resp: {r.respuesta}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        render: (r) => <EstadoBadge estado={r.estado} />,
      },
      {
        key: "asignado",
        header: "Asignado a",
        render: (r) => (
          <span className="text-xs text-text-secondary">
            {r.asignadoANombre || <span className="text-text-tertiary italic">Sin asignar</span>}
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
      keyExtractor={(r) => r.id}
      loading={crud.loading}
      emptyMessage="No hay reclamos cargados aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => crud.handleEdit(r)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar o responder reclamo"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(r)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar reclamo"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
