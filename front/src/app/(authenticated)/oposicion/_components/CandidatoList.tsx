"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { CandidatoResponseDTO, NivelAmenaza } from "../../../../types/oposicion"
import { Pencil, Trash2, Phone, Mail, ShieldAlert, Sparkles, TrendingDown } from "lucide-react"

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface CandidatoListProps {
  crud: CrudState<CandidatoResponseDTO>
  onDelete: (c: CandidatoResponseDTO) => void
}

function AmenazaBadge({ nivel }: { nivel: NivelAmenaza }) {
  switch (nivel) {
    case "CRITICO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger-light text-danger border border-danger">
          <ShieldAlert size={12} />
          Crítico
        </span>
      )
    case "ALTO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-light text-orange border border-orange">
          Alto
        </span>
      )
    case "MEDIO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning">
          Medio
        </span>
      )
    case "BAJO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-secondary text-text-tertiary">
          Bajo
        </span>
      )
  }
}

export function CandidatoList({ crud, onDelete }: CandidatoListProps) {
  const columns: DataTableColumn<CandidatoResponseDTO>[] = useMemo(
    () => [
      {
        key: "candidato",
        header: "Candidato / Cargo",
        render: (c) => (
          <div>
            <div className="font-semibold text-text-primary text-sm">
              {c.nombre} {c.apellido}
            </div>
            {c.cargo && <p className="text-xs text-text-tertiary mt-0.5 font-medium">{c.cargo}</p>}
          </div>
        ),
      },
      {
        key: "partido",
        header: "Partido Político",
        render: (c) => (
          <div className="flex items-center gap-1.5">
            {c.partidoColor && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border"
                style={{ backgroundColor: c.partidoColor }}
              />
            )}
            <span className="text-sm font-medium text-text-secondary">
              {c.partidoNombre || <span className="text-text-tertiary italic">Independiente</span>}
            </span>
          </div>
        ),
      },
      {
        key: "amenaza",
        header: "Nivel de Amenaza",
        render: (c) => <AmenazaBadge nivel={c.nivelAmenaza} />,
      },
      {
        key: "estrategia",
        header: "FODA Político / Estrategia",
        render: (c) => (
          <div className="max-w-xs space-y-1 text-xs">
            {c.fortalezas && (
              <div className="flex items-start gap-1 text-success">
                <Sparkles size={12} className="shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c.fortalezas}</span>
              </div>
            )}
            {c.debilidades && (
              <div className="flex items-start gap-1 text-danger">
                <TrendingDown size={12} className="shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c.debilidades}</span>
              </div>
            )}
            {c.infoEstrategica && (
              <p className="text-text-secondary line-clamp-1 italic">{c.infoEstrategica}</p>
            )}
          </div>
        ),
      },
      {
        key: "contacto",
        header: "Canales",
        render: (c) => (
          <div className="text-xs text-text-secondary space-y-0.5">
            {c.telefono && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-text-tertiary shrink-0" />
                <span>{c.telefono}</span>
              </div>
            )}
            {c.instagram && (
              <div className="flex items-center gap-1 text-primary">
                <InstagramIcon size={12} />
                <span>@{c.instagram.replace("@", "")}</span>
              </div>
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
      keyExtractor={(c) => c.id}
      loading={crud.loading}
      emptyMessage="No hay candidatos opositores registrados aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => crud.handleEdit(c)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar candidato"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(c)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar candidato"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
