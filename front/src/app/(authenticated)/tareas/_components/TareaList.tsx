"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { TareaResponseDTO, EstadoTarea, PrioridadTarea } from "../../../../types/tarea"
import { Pencil, Trash2, Calendar, MessageSquare, Tag } from "lucide-react"

interface TareaListProps {
  crud: CrudState<TareaResponseDTO>
  onDelete: (t: TareaResponseDTO) => void
  onVerDetalle: (t: TareaResponseDTO) => void
}

function EstadoBadge({ estado }: { estado: EstadoTarea }) {
  switch (estado) {
    case "PENDIENTE":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning border border-warning">Pendiente</span>
    case "EN_PROGRESO":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-info-light text-info border border-info">En progreso</span>
    case "EN_REVISION":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-light text-violet border border-violet">En revisión</span>
    case "COMPLETADA":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success border border-success">Completada</span>
    case "CANCELADA":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-bg-secondary text-text-tertiary">Cancelada</span>
  }
}

function PrioridadBadge({ prio }: { prio: PrioridadTarea }) {
  switch (prio) {
    case "URGENTE":
      return <span className="text-xs font-extrabold text-danger uppercase tracking-wider">Urgente</span>
    case "ALTA":
      return <span className="text-xs font-bold text-orange">Alta</span>
    case "MEDIA":
      return <span className="text-xs font-medium text-warning">Media</span>
    case "BAJA":
      return <span className="text-xs text-text-tertiary">Baja</span>
  }
}

export function TareaList({ crud, onDelete, onVerDetalle }: TareaListProps) {
  const columns: DataTableColumn<TareaResponseDTO>[] = useMemo(
    () => [
      {
        key: "titulo",
        header: "Tarea / Título",
        render: (t) => (
          <div>
            <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span>{t.titulo}</span>
              {t.comentarios?.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-accent font-medium bg-accent-light px-1.5 py-0.5 rounded-full">
                  <MessageSquare size={11} />
                  {t.comentarios.length}
                </span>
              )}
            </div>
            {t.descripcion && (
              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{t.descripcion}</p>
            )}
            {t.etiquetas?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {t.etiquetas.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-text-tertiary bg-bg-secondary px-1.5 py-0.5 rounded">
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        render: (t) => <EstadoBadge estado={t.estado} />,
      },
      {
        key: "prioridad",
        header: "Prioridad",
        render: (t) => <PrioridadBadge prio={t.prioridad} />,
      },
      {
        key: "asignado",
        header: "Asignado a",
        render: (t) => {
          if (!t.asignados || t.asignados.length === 0) {
            return (
              <span className="text-xs font-semibold text-primary">Todo el equipo</span>
            )
          }
          if (t.asignados.length === 1) {
            return (
              <span className="text-xs text-text-secondary font-medium">
                {t.asignados[0].nombre} {t.asignados[0].apellido}
              </span>
            )
          }
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-text-secondary font-medium">
                {t.asignados[0].nombre} {t.asignados[0].apellido}
              </span>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-light text-primary cursor-help"
                title={t.asignados.map((a) => `${a.nombre} ${a.apellido}`).join(", ")}
              >
                +{t.asignados.length - 1} más
              </span>
            </div>
          )
        },
      },
      {
        key: "fechaLimite",
        header: "Fecha Límite",
        render: (t) => (
          <div className="text-xs text-text-secondary">
            {t.fechaLimite ? (
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-text-tertiary" />
                {t.fechaLimite}
              </span>
            ) : (
              <span className="text-text-tertiary italic">Sin límite</span>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={crud.data}
      keyExtractor={(t) => t.id}
      loading={crud.loading}
      emptyMessage="No hay tareas cargadas aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onVerDetalle(t)}
            className="p-2 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent-light transition-colors"
            title="Ver detalle y comentarios"
          >
            <MessageSquare size={15} />
          </button>
          <button
            onClick={() => crud.handleEdit(t)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar tarea"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(t)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar tarea"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
