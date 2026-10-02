"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { EscuelaResponseDTO } from "../../../../types/escuela"
import { Pencil, Trash2, GraduationCap, MapPin, Phone, Mail, User } from "lucide-react"

interface EscuelaListProps {
  crud: CrudState<EscuelaResponseDTO>
  onDelete: (escuela: EscuelaResponseDTO) => void
}

export function EscuelaList({ crud, onDelete }: EscuelaListProps) {
  const columns: DataTableColumn<EscuelaResponseDTO>[] = useMemo(
    () => [
      {
        key: "nombre",
        header: "Escuela / Institución",
        render: (e) => (
          <div>
            <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <GraduationCap size={16} className="text-primary shrink-0" />
              <span>
                {e.nombre} {e.numero ? `N° ${e.numero}` : ""}
              </span>
            </div>
            {e.modalidad && (
              <p className="text-xs text-text-tertiary ml-6 mt-0.5">{e.modalidad}</p>
            )}
          </div>
        ),
      },
      {
        key: "nivel",
        header: "Nivel Educativo",
        render: (e) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
            {e.nivel}
          </span>
        ),
      },
      {
        key: "ubicacion",
        header: "Ubicación",
        render: (e) => (
          <div className="text-sm">
            {e.direccion ? (
              <div className="text-text-primary flex items-center gap-1">
                <MapPin size={13} className="text-text-tertiary shrink-0" />
                <span>{e.direccion}</span>
              </div>
            ) : (
              <span className="text-text-tertiary text-xs italic">Sin dirección</span>
            )}
            {e.barrioNombre && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-bg-secondary text-text-secondary text-xs">
                {e.barrioNombre}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "director",
        header: "Dirección / Contacto",
        render: (e) => (
          <div className="text-xs text-text-secondary space-y-0.5">
            {e.director ? (
              <div className="flex items-center gap-1 text-text-primary font-medium">
                <User size={12} className="text-text-tertiary shrink-0" />
                <span>{e.director}</span>
              </div>
            ) : (
              <span className="text-text-tertiary italic">Directivo no registrado</span>
            )}
            {e.telefonoDirector && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-text-tertiary shrink-0" />
                <span>{e.telefonoDirector}</span>
              </div>
            )}
            {e.emailDirector && (
              <div className="flex items-center gap-1">
                <Mail size={12} className="text-text-tertiary shrink-0" />
                <span className="truncate max-w-[130px]">{e.emailDirector}</span>
              </div>
            )}
          </div>
        ),
      },

      {
        key: "estado",
        header: "Estado",
        render: (e) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              e.activa ? "bg-success-light text-success" : "bg-bg-secondary text-text-tertiary"
            }`}
          >
            {e.activa ? "Activa" : "Inactiva"}
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
      keyExtractor={(e) => e.id}
      loading={crud.loading}
      emptyMessage="No hay escuelas registradas aún."
      serverSideSearch
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(e) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => crud.handleEdit(e)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Editar escuela"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(e)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar escuela"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
