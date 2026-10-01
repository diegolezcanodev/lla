export function TablePageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 flex flex-col flex-1 min-h-0 ${className}`}>
      <div className="space-y-6 flex flex-col flex-1 min-h-0 animate-pulse">
        {/* Header: Título y subtítulo a la izquierda, botón de acción a la derecha */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-md bg-bg-secondary" />
            <div className="h-3.5 w-56 rounded-md bg-bg-secondary" />
          </div>
          <div className="h-9 w-32 rounded-md bg-bg-secondary" />
        </div>

        {/* Card de Tabla con buscador, filtros, filas y paginación */}
        <div className="bg-white border border-border rounded-xl shadow-xs flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Barra de búsqueda y filtros */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-border flex-wrap shrink-0 bg-white">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Buscador */}
              <div className="h-9 w-64 md:w-80 rounded-md bg-bg-secondary" />
              {/* Filtro / selector */}
              <div className="h-9 w-24 rounded-md bg-bg-secondary" />
            </div>
          </div>

          {/* Cabecera de la tabla */}
          <div className="h-10 w-full bg-bg-secondary/60 border-b border-border px-4 flex items-center shrink-0">
            <div className="h-3.5 w-full rounded bg-bg-secondary" />
          </div>

          {/* Filas de datos */}
          <div className="flex-1 divide-y divide-border overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 px-4 flex items-center gap-4">
                <div className="h-3.5 rounded bg-bg-secondary w-1/4" />
                <div className="h-3.5 rounded bg-bg-secondary w-1/3" />
                <div className="h-3.5 rounded bg-bg-secondary w-1/5" />
                <div className="h-3.5 rounded bg-bg-secondary flex-1" />
              </div>
            ))}
          </div>

          {/* Paginación inferior dentro de la card */}
          <div className="p-4 border-t border-border bg-white flex items-center justify-between shrink-0">
            {/* Izquierda: Mostrar [10] por página */}
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-12 rounded bg-bg-secondary" />
              <div className="h-8 w-16 rounded-lg bg-bg-secondary" />
              <div className="h-3.5 w-16 rounded bg-bg-secondary" />
            </div>

            {/* Derecha: < [1] > */}
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 rounded-md bg-bg-secondary" />
              <div className="h-8 w-8 rounded-md bg-bg-secondary" />
              <div className="h-8 w-8 rounded-md bg-bg-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
