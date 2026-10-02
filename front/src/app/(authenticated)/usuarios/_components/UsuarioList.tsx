'use client'

import { useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '../../../../components/DataTable'
import type { DataTableColumn } from '../../../../components/DataTable'
import type { CrudState } from '../../../../lib/useCrud'
import type { UserResponseDTO } from '../../../../types/user'
import { StatusBadge } from '../../../../components/StatusBadge'

interface UsuarioListProps {
  crud: CrudState<UserResponseDTO>
  onDelete: (usuario: UserResponseDTO) => void
}

function RolBadges({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => {
        const normalized = r.toUpperCase()
        const isAdmin = normalized.includes('ADMIN')
        return (
          <StatusBadge
            key={r}
            status={normalized}
            label={r}
            tone={isAdmin ? 'violet' : 'blue'}
            size="sm"
            showIcon={false}
          />
        )
      })}
    </div>
  )
}

export function UsuarioList({ crud, onDelete }: UsuarioListProps) {
  const columns: DataTableColumn<UserResponseDTO>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Usuario',
        render: (u) => (
          <div className="flex flex-col">
            <span className="text-sm text-text-primary font-semibold">
              {u.apellido}, {u.nombre}
            </span>
            {u.nombreUsuario && (
              <span className="text-xs text-text-tertiary">@{u.nombreUsuario}</span>
            )}
          </div>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        render: (u) => <span className="text-sm text-text-secondary">{u.email}</span>,
        hideOnMobile: true,
      },
      {
        key: 'roles',
        header: 'Roles',
        render: (u) => <RolBadges roles={u.roles} />,
      },
      {
        key: 'activo',
        header: 'Estado',
        width: '110px',
        render: (u) => <StatusBadge status={u.activo ? 'ACTIVO' : 'INACTIVO'} size="sm" />,
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={crud.data}
      keyExtractor={(u) => u.id}
      loading={crud.loading}
      emptyMessage="No hay usuarios aún. Creá uno nuevo para comenzar."
      serverSideSearch
      searchPlaceholder="Buscar por nombre, apellido, usuario o email..."
      page={crud.page}
      totalPages={crud.totalPages}
      onPageChange={crud.handlePageChange}
      pageSize={crud.pageSize}
      onPageSizeChange={crud.setPageSize}
      search={crud.search}
      onSearchChange={crud.setSearch}
      renderActions={(u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => crud.handleEdit(u)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-violet-50 transition-colors"
            title="Editar usuario"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(u)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
            title="Eliminar usuario"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    />
  )
}
