export function DashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 flex flex-col gap-6 flex-1 min-h-0 ${className}`}>
      <div className="flex flex-col gap-6 flex-1 min-h-0 animate-pulse">
        {/* Header: Título y subtítulo */}
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-md bg-bg-secondary" />
          <div className="h-4 w-64 rounded-md bg-bg-secondary" />
        </div>

        {/* Grid de KPIs (3 tarjetas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 - Accent */}
          <div className="rounded-lg border border-border border-l-4 border-l-accent/40 bg-white p-5 space-y-2">
            <div className="h-4 w-32 rounded bg-bg-secondary" />
            <div className="h-9 w-14 rounded bg-bg-secondary" />
            <div className="h-3 w-28 rounded bg-bg-secondary" />
          </div>

          {/* Card 2 - Info */}
          <div className="rounded-lg border border-border border-l-4 border-l-info/40 bg-white p-5 space-y-2">
            <div className="h-4 w-36 rounded bg-bg-secondary" />
            <div className="h-9 w-14 rounded bg-bg-secondary" />
            <div className="h-3 w-32 rounded bg-bg-secondary" />
          </div>

          {/* Card 3 - Secondary */}
          <div className="rounded-lg border border-border border-l-4 border-l-secondary/40 bg-white p-5 space-y-2">
            <div className="h-4 w-28 rounded bg-bg-secondary" />
            <div className="h-9 w-14 rounded bg-bg-secondary" />
            <div className="h-3 w-28 rounded bg-bg-secondary" />
          </div>
        </div>

        {/* Caja punteada de próximos módulos */}
        <div className="rounded-lg border border-dashed border-border bg-bg p-8 flex items-center justify-center">
          <div className="h-4 w-96 max-w-full rounded bg-bg-secondary" />
        </div>
      </div>
    </div>
  )
}
