"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { StakeholderResponseDTO, TemperaturaRelacion } from "../../../../types/stakeholder"
import { Pencil, Trash2, Phone, Mail, MapPin, RefreshCw, Flame, Snowflake, Clock, ShieldCheck, AlertTriangle } from "lucide-react"

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface StakeholderListProps {
  crud: CrudState<StakeholderResponseDTO>
  onDelete: (s: StakeholderResponseDTO) => void
  onRegistrarContacto: (s: StakeholderResponseDTO) => void
}

function TemperaturaBadge({ temp }: { temp: TemperaturaRelacion }) {
  switch (temp) {
    case "ALIADO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-light text-violet border border-violet">
          <ShieldCheck size={12} />
          Aliado
        </span>
      )
    case "CALIENTE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-light text-orange border border-orange">
          <Flame size={12} />
          Caliente (&le;5d)
        </span>
      )
    case "TIBIA":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning">
          <Clock size={12} />
          Tibia (6-10d)
        </span>
      )
    case "FRIA":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-light text-info border border-info">
          <Snowflake size={12} />
          Fría (11-20d)
        </span>
      )
    case "DISTANTE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-secondary text-text-tertiary">
          Distante (21-60d)
        </span>
      )
    case "PERDIDO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger border border-danger">
          <AlertTriangle size={12} />
          Perdido (&gt;60d)
        </span>
      )
  }
}

export function StakeholderList({ crud, onDelete, onRegistrarContacto }: StakeholderListProps) {
  const columns: DataTableColumn<StakeholderResponseDTO>[] = useMemo(
    () => [
      {
        key: "nombre",
        header: "Actor Clave / Referente",
        render: (s) => (
          <div>
            <div className="font-semibold text-text-primary text-sm">
              {s.nombre} {s.apellido}
            </div>
            {(s.cargo || s.organizacion) && (
              <p className="text-xs text-text-secondary mt-0.5">
                {s.cargo} {s.cargo && s.organizacion ? "·" : ""} {s.organizacion}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "temperatura",
        header: "Temperatura CRM",
        render: (s) => (
          <div>
            <TemperaturaBadge temp={s.temperatura} />
            <p className="text-[11px] text-text-tertiary mt-1">
              Último: {s.fechaUltimoContacto}
            </p>
          </div>
        ),
      },
      {
        key: "influencia",
        header: "Influencia",
        render: (s) => (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3.5 rounded-sm ${
                    i < s.nivelInfluencia ? "bg-accent" : "bg-bg-secondary"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-text-tertiary">{s.nivelInfluencia}/10</span>
          </div>
        ),
      },
      {
        key: "territorio",
        header: "Barrio / Territorio",
        render: (s) => (
          <div className="text-sm">
            {s.barrioNombre ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-light text-primary text-xs font-medium">
                <MapPin size={12} />
                {s.barrioNombre}
              </span>
            ) : (
              <span className="text-text-tertiary text-xs italic">General / Sin zona</span>
            )}
          </div>
        ),
      },
      {
        key: "contacto",
        header: "Canales de contacto",
        render: (s) => (
          <div className="text-xs text-text-secondary space-y-0.5">
            {s.telefono && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-text-tertiary shrink-0" />
                <span>{s.telefono}</span>
              </div>
            )}
            {s.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} className="text-text-tertiary shrink-0" />
                <span className="truncate max-w-[130px]">{s.email}</span>
              </div>
            )}
            {s.instagram && (
              <div className="flex items-center gap-1 text-primary">
                <InstagramIcon size={12} />
                <span>@{s.instagram.replace("@", "")}</span>
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
      keyExtractor={(s) => s.id}
      loading={crud.loading}
      emptyMessage="No hay actores clave registrados aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onRegistrarContacto(s)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent hover:bg-accent-light transition-colors"
            title="Registrar contacto hoy para reactivar temperatura"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Contactado hoy</span>
          </button>
          <button
            onClick={() => crud.handleEdit(s)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar actor clave"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar actor clave"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
