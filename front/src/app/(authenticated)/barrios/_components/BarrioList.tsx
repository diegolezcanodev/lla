'use client'

import { useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '../../../../components/DataTable'
import type { DataTableColumn } from '../../../../components/DataTable'
import type { CrudState } from '../../../../lib/useCrud'
import type { BarrioResponseDTO, PrioridadBarrio } from '../../../../types/barrio'
import { StatusBadge } from '../../../../components/StatusBadge'

interface BarrioListProps {
  crud: CrudState<BarrioResponseDTO>
  onDelete: (barrio: BarrioResponseDTO) => void
}

function PrioridadBadge({ prioridad }: { prioridad: PrioridadBarrio }) {
  switch (prioridad) {
    case 'ALTA':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Alta
        </span>
      )
    case 'EN_DISPUTA':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          En disputa
        </span>
      )
    case 'MEDIA':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Media
        </span>
      )
    case 'BAJA':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Baja
        </span>
      )
    default:
      return <span>{prioridad}</span>
  }
}

export function BarrioList({ crud, onDelete }: BarrioListProps) {
  const columns: DataTableColumn<BarrioResponseDTO>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Barrio',
        render: (b) => (
          <div className="flex items-center gap-3">
            {b.color && (
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-black/10"
                style={{ backgroundColor: b.color }}
                title={`Color: ${b.color}`}
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{b.nombre}</span>
                {b.codigo && (
                  <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-bg-secondary text-text-secondary border border-border">
                    {b.codigo}
                  </span>
                )}
              </div>
              {b.descripcion && (
                <span className="text-xs text-text-tertiary truncate max-w-xs">{b.descripcion}</span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'prioridad',
        header: 'Prioridad',
        width: '120px',
        render: (b) => <PrioridadBadge prioridad={b.prioridad} />,
      },
      {
        key: 'tags',
        header: 'Tags / Características',
        render: (b) => {
          if (!b.tags || b.tags.length === 0) {
            return <span className="text-xs text-text-tertiary italic">Sin tags</span>
          }
          return (
            <div className="flex flex-wrap gap-1">
              {b.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-secondary/5 text-secondary border border-secondary/15 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )
        },
      },
      {
        key: 'activo',
        header: 'Estado',
        width: '100px',
        render: (b) => <StatusBadge status={b.activo ? 'ACTIVO' : 'INACTIVO'} size="sm" />,
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={crud.data}
      keyExtractor={(b) => b.id}
      loading={crud.loading}
      emptyMessage="No hay barrios cargados aún. Creá el primero para comenzar."
      serverSideSearch
      searchPlaceholder="Buscar por nombre, código o descripción..."
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(b) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => crud.handleEdit(b)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-violet-50 transition-colors"
            title="Editar barrio"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(b)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar barrio"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    />
  )
}
