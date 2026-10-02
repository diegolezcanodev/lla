"use client"

import { useMemo } from "react"
import { DataTable, DataTableColumn } from "../../../../components/DataTable"
import { CrudState } from "../../../../lib/useCrud"
import type { EmpresaResponseDTO } from "../../../../types/empresa"
import { Pencil, Trash2, Building2, MapPin, Phone, Mail, User } from "lucide-react"

interface EmpresaListProps {
  crud: CrudState<EmpresaResponseDTO>
  onDelete: (empresa: EmpresaResponseDTO) => void
}

export function EmpresaList({ crud, onDelete }: EmpresaListProps) {
  const columns: DataTableColumn<EmpresaResponseDTO>[] = useMemo(
    () => [
      {
        key: "nombre",
        header: "Empresa / Razón Social",
        render: (e) => (
          <div>
            <div className="font-medium text-text-primary flex items-center gap-2">
              <Building2 size={16} className="text-primary shrink-0" />
              <span>{e.nombre}</span>
            </div>
            {e.cuit && <p className="text-xs text-text-tertiary font-mono ml-6">CUIT: {e.cuit}</p>}
          </div>
        ),
      },
      {
        key: "rubro",
        header: "Rubro & Tamaño",
        render: (e) => (
          <div>
            <span className="text-sm text-text-secondary">{e.rubro || "Sin rubro"}</span>
            {e.tamano && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bg-secondary text-text-tertiary">
                {e.tamano}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "ubicacion",
        header: "Ubicación",
        render: (e) => (
          <div className="text-sm">
            <div className="text-text-primary flex items-center gap-1.5">
              <MapPin size={14} className="text-text-tertiary shrink-0" />
              <span>{e.direccion}</span>
            </div>
            {e.barrioNombre && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-primary-light text-primary text-xs font-medium">
                {e.barrioNombre}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "contacto",
        header: "Contacto Principal",
        render: (e) => (
          <div className="text-xs text-text-secondary space-y-0.5">
            {e.contactoPrincipal && (
              <div className="flex items-center gap-1 text-text-primary font-medium">
                <User size={12} className="text-text-tertiary shrink-0" />
                <span>{e.contactoPrincipal}</span>
              </div>
            )}
            {e.telefono && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-text-tertiary shrink-0" />
                <span>{e.telefono}</span>
              </div>
            )}
            {e.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} className="text-text-tertiary shrink-0" />
                <span className="truncate max-w-[140px]">{e.email}</span>
              </div>
            )}
            {!e.contactoPrincipal && !e.telefono && !e.email && (
              <span className="text-text-tertiary italic">Sin contacto registrado</span>
            )}
          </div>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        render: (e) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              e.activa ? "bg-success-light text-success border border-success" : "bg-bg-secondary text-text-tertiary"
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
      emptyMessage="No hay empresas registradas aún."
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
            title="Editar empresa"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(e)}
            className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar empresa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    />
  )
}
