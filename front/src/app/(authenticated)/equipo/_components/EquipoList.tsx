'use client'

import { useMemo } from 'react'
import { Pencil, Trash2, MessageCircle, UserCheck } from 'lucide-react'
import { DataTable } from '../../../../components/DataTable'
import type { DataTableColumn } from '../../../../components/DataTable'
import type { CrudState } from '../../../../lib/useCrud'
import type { MiembroEquipoResponseDTO, TipoMiembro } from '../../../../types/equipo'
import { StatusBadge } from '../../../../components/StatusBadge'

function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface EquipoListProps {
  crud: CrudState<MiembroEquipoResponseDTO>
  onDelete: (miembro: MiembroEquipoResponseDTO) => void
}

function TipoBadge({ tipo }: { tipo: TipoMiembro }) {
  switch (tipo) {
    case 'EQUIPO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          Equipo
        </span>
      )
    case 'ESTRATEGIA':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Estrategia
        </span>
      )
    case 'FISCAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Fiscal
        </span>
      )
    case 'VECINO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Vecino
        </span>
      )
    default:
      return <span>{tipo}</span>
  }
}

export function EquipoList({ crud, onDelete }: EquipoListProps) {
  const columns: DataTableColumn<MiembroEquipoResponseDTO>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Persona',
        render: (m) => (
          <div className="flex flex-col">
            <span className="text-sm text-text-primary font-semibold">
              {m.apellido}, {m.nombre}
            </span>
            {m.dni ? (
              <span className="text-xs text-text-tertiary">DNI: {m.dni}</span>
            ) : (
              <span className="text-xs text-text-tertiary italic">Sin DNI</span>
            )}
          </div>
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        width: '120px',
        render: (m) => <TipoBadge tipo={m.tipo} />,
      },
      {
        key: 'barrio',
        header: 'Barrio y Dirección',
        render: (m) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-secondary">
              {m.barrioNombre || 'Sin barrio'}
            </span>
            {m.direccion && (
              <span className="text-xs text-text-tertiary truncate max-w-[200px]">
                {m.direccion}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'contacto',
        header: 'Contacto y Redes',
        render: (m) => {
          const cleanPhone = m.telefono ? m.telefono.replace(/\D/g, '') : null
          const waUrl = cleanPhone
            ? `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : '549' + cleanPhone}`
            : null

          return (
            <div className="flex flex-col gap-1">
              {m.telefono ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-secondary">{m.telefono}</span>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Abrir chat en WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              ) : null}

              {m.email && <span className="text-xs text-text-tertiary">{m.email}</span>}

              {m.instagram && (
                <a
                  href={`https://instagram.com/${m.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-pink-700 hover:underline"
                  title="Ver perfil de Instagram"
                >
                  <InstagramIcon size={13} />
                  <span>@{m.instagram}</span>
                </a>
              )}

              {!m.telefono && !m.email && !m.instagram && (
                <span className="text-xs text-text-tertiary italic">Sin contacto</span>
              )}
            </div>
          )
        },
      },
      {
        key: 'usuarioId',
        header: 'Acceso Sistema',
        hideOnMobile: true,
        render: (m) => {
          if (m.usuarioId) {
            return (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <UserCheck size={14} />
                <span className="truncate max-w-[150px]">{m.usuarioEmail || 'Usuario activo'}</span>
              </div>
            )
          }
          return <span className="text-xs text-text-tertiary">Sin usuario</span>
        },
      },
      {
        key: 'activo',
        header: 'Estado',
        width: '100px',
        render: (m) => <StatusBadge status={m.activo ? 'ACTIVO' : 'INACTIVO'} size="sm" />,
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={crud.data}
      keyExtractor={(m) => m.id}
      loading={crud.loading}
      emptyMessage="No se encontraron miembros del equipo."
      serverSideSearch
      searchPlaceholder="Buscar por nombre, apellido, DNI, teléfono, dirección..."
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(m) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => crud.handleEdit(m)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-violet-50 transition-colors"
            title="Editar miembro"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(m)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar miembro"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    />
  )
}
