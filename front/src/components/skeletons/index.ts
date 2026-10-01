import type { ComponentType } from 'react'
import { DashboardSkeleton } from './DashboardSkeleton'
import { TablePageSkeleton } from './TablePageSkeleton'
import { PagosSkeleton } from './PagosSkeleton'

export { DashboardSkeleton, TablePageSkeleton, PagosSkeleton }

export type SkeletonComponent = ComponentType<{ className?: string }>

/**
 * Resuelve el componente de skeleton apropiado según la ruta de destino.
 * Por defecto retorna TablePageSkeleton para todas las pantallas con tabla.
 */
export function getSkeletonForRoute(pathname?: string | null): SkeletonComponent {
  if (!pathname) return TablePageSkeleton

  const cleanPath = pathname.split('?')[0]

  if (cleanPath === '/dashboard' || cleanPath.startsWith('/dashboard/')) {
    return DashboardSkeleton
  }

  if (cleanPath === '/pagos' || cleanPath.startsWith('/pagos/')) {
    return PagosSkeleton
  }

  // Pantallas de tabla generales (Clientes, Proyectos, Recursos, Usuarios)
  return TablePageSkeleton
}
