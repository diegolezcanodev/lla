'use client'

import { Users, UserX, ListFilter } from 'lucide-react'

export type EstadoFilter = 'activos' | 'inactivos' | 'todos'

interface EstadoFilterTabsProps {
  value: EstadoFilter
  onChange: (value: EstadoFilter) => void
  labels?: {
    activos?: string
    inactivos?: string
    todos?: string
  }
}

export function EstadoFilterTabs({
  value,
  onChange,
  labels = { activos: 'Activos', inactivos: 'Inactivos', todos: 'Todos' },
}: EstadoFilterTabsProps) {
  return (
    <div className="flex items-center bg-bg-secondary p-1 rounded-lg border border-border text-xs font-medium">
      <button
        type="button"
        onClick={() => onChange('activos')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
          value === 'activos'
            ? 'bg-white text-text-primary shadow-xs font-semibold'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        {labels.activos ?? 'Activos'}
      </button>
      <button
        type="button"
        onClick={() => onChange('inactivos')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
          value === 'inactivos'
            ? 'bg-white text-text-primary shadow-xs font-semibold'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        <UserX className="w-3.5 h-3.5" />
        {labels.inactivos ?? 'Inactivos'}
      </button>
      <button
        type="button"
        onClick={() => onChange('todos')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
          value === 'todos'
            ? 'bg-white text-text-primary shadow-xs font-semibold'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        <ListFilter className="w-3.5 h-3.5" />
        {labels.todos ?? 'Todos'}
      </button>
    </div>
  )
}
