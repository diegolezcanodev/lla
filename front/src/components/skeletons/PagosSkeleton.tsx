import React from 'react'

export function PagosSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 flex flex-col gap-6 flex-1 min-h-0 ${className}`}>
      <div className="space-y-6 animate-pulse">
        {/* Header de la página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-bg-secondary rounded-lg" />
            <div className="h-4 w-72 bg-bg-secondary/60 rounded" />
          </div>
        </div>

        {/* Barra de Controles: Selector de semana y Buscador */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-2xs">
          <div className="h-10 w-64 bg-bg-secondary rounded-xl" />
          <div className="h-10 w-72 bg-bg-secondary rounded-xl" />
        </div>

        {/* 4 KPIs de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-border shadow-2xs space-y-2"
            >
              <div className="h-3.5 w-24 bg-bg-secondary rounded" />
              <div className="h-6 w-32 bg-bg-secondary/80 rounded" />
            </div>
          ))}
        </div>

        {/* 2 Tarjetas simuladas de clientes con tablas */}
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Cabecera cliente */}
            <div className="px-5 py-4 border-b border-border bg-bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-bg-secondary" />
                <div className="h-5 w-40 bg-bg-secondary rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-24 bg-bg-secondary rounded" />
                <div className="h-4 w-24 bg-bg-secondary rounded" />
              </div>
            </div>

            {/* Filas de tabla */}
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between gap-4 py-2 border-b border-border/40">
                  <div className="h-4 w-32 bg-bg-secondary rounded" />
                  <div className="h-4 w-48 bg-bg-secondary/70 rounded" />
                  <div className="h-4 w-48 bg-bg-secondary/70 rounded" />
                  <div className="h-4 w-20 bg-bg-secondary rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
