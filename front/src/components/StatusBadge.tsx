'use client'

import React from 'react'
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  PauseCircle,
  MessageSquareText,
  Percent,
  XCircle,
  ChevronDown,
  Banknote,
  ArrowLeftRight,
  HardHat,
  Store,
  Shield,
  User,
  FileCheck,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

export type BadgeTone =
  | 'blue'      // En progreso / activo
  | 'emerald'   // Éxito / completado / pagado
  | 'amber'     // Espera / pendiente / advertencia
  | 'rose'      // Suspendido / cancelado / error
  | 'violet'    // Comunicado / revisión
  | 'cyan'      // Parcial / intermedio
  | 'slate'     // Neutral / inactivo

export type BadgeVariant = 'subtle' | 'solid' | 'outline'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface StatusConfig {
  label: string
  tone: BadgeTone
  icon?: LucideIcon
}

/**
 * Registro unificado de estados del sistema para Brucke.
 * Centraliza nombres, iconos y tonalidades para que cambiar un estado
 * impacte automáticamente en todas las pantallas.
 */
export const SYSTEM_STATUS_CONFIGS: Record<string, StatusConfig> = {
  // 1. Etapas
  PENDIENTE: { label: 'Pendiente', tone: 'amber', icon: Clock },
  EN_CURSO: { label: 'En curso', tone: 'blue', icon: PlayCircle },
  COMPLETADA: { label: 'Completada', tone: 'emerald', icon: CheckCircle2 },
  SUSPENDIDA: { label: 'Suspendida', tone: 'rose', icon: PauseCircle },

  // 2. Materiales
  PENDIENTE_COMUNICAR: { label: 'Pend. Comunicar', tone: 'amber', icon: Clock },
  COMUNICADO_IMPAGO: { label: 'Comunicado impago', tone: 'violet', icon: MessageSquareText },
  PAGO_PARCIAL: { label: 'Pago parcial', tone: 'cyan', icon: Percent },
  PAGADO: { label: 'Pagado', tone: 'emerald', icon: CheckCircle2 },

  // 3. Presupuestos (Cliente)
  PENDIENTE_APROBACION: { label: 'Pend. Aprobación', tone: 'amber', icon: Clock },
  APROBADO: { label: 'Aprobado', tone: 'emerald', icon: CheckCircle2 },
  SUSPENDIDO: { label: 'Suspendido', tone: 'rose', icon: PauseCircle },
  RECHAZADO: { label: 'Rechazado', tone: 'rose', icon: XCircle },
  FINALIZADO: { label: 'Finalizado', tone: 'emerald', icon: CheckCircle2 },

  // 4. Proyectos
  PLANIFICACION: { label: 'Planificación', tone: 'violet', icon: Clock },
  PAUSADO: { label: 'Pausado', tone: 'rose', icon: PauseCircle },
  CANCELADO: { label: 'Cancelado', tone: 'rose', icon: XCircle },

  // 5. Gastos Operativos, Pagos & Formas de Pago
  IMPAGO: { label: 'Impago', tone: 'amber', icon: Clock },
  RECIBO_SIN_CONFIRMAR: { label: 'Recibo sin confirmar', tone: 'cyan', icon: FileCheck },
  PEDIDO_DINERARIO: { label: 'Pedido Dinerario', tone: 'slate', icon: HandCoins },
  COBRO: { label: 'Cobro', tone: 'emerald', icon: ArrowDownLeft },
  PAGO: { label: 'Pago', tone: 'rose', icon: ArrowUpRight },
  EFECTIVO: { label: 'Efectivo', tone: 'blue', icon: Banknote },
  TRANSFERENCIA: { label: 'Transferencia', tone: 'violet', icon: ArrowLeftRight },

  // 6. Recursos (Tipo de Rubro)
  MANO_OBRA: { label: 'Contratista', tone: 'violet', icon: HardHat },
  MATERIALES: { label: 'Comercio', tone: 'blue', icon: Store },

  // 7. Roles de Usuario
  ADMINISTRADOR: { label: 'Administrador', tone: 'violet', icon: Shield },
  ADMIN: { label: 'Admin', tone: 'violet', icon: Shield },
  OPERADOR: { label: 'Operador', tone: 'blue', icon: User },
  USUARIO: { label: 'Usuario', tone: 'blue', icon: User },

  // 8. Genéricos (Clientes, Recursos, Usuarios, etc.)
  ACTIVO: { label: 'Activo', tone: 'emerald', icon: CheckCircle2 },
  INACTIVO: { label: 'Inactivo', tone: 'slate', icon: Clock },
}

const TONE_STYLES: Record<
  BadgeTone,
  {
    subtle: { container: string; icon: string; dot: string }
    solid: { container: string; icon: string; dot: string }
    outline: { container: string; icon: string; dot: string }
  }
> = {
  blue: {
    subtle: {
      container: 'bg-blue-100 text-blue-900 border-blue-300 shadow-2xs',
      icon: 'text-blue-600',
      dot: 'bg-blue-500',
    },
    solid: {
      container: 'bg-blue-600 text-white border-blue-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-blue-800 border-blue-400',
      icon: 'text-blue-600',
      dot: 'bg-blue-600',
    },
  },
  emerald: {
    subtle: {
      container: 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs',
      icon: 'text-emerald-700',
      dot: 'bg-emerald-600',
    },
    solid: {
      container: 'bg-emerald-600 text-white border-emerald-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-emerald-800 border-emerald-400',
      icon: 'text-emerald-700',
      dot: 'bg-emerald-600',
    },
  },
  amber: {
    subtle: {
      container: 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs',
      icon: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    solid: {
      container: 'bg-amber-500 text-white border-amber-500 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-amber-900 border-amber-400',
      icon: 'text-amber-700',
      dot: 'bg-amber-500',
    },
  },
  rose: {
    subtle: {
      container: 'bg-rose-100 text-rose-950 border-rose-300 shadow-2xs',
      icon: 'text-rose-600',
      dot: 'bg-rose-500',
    },
    solid: {
      container: 'bg-rose-600 text-white border-rose-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-rose-800 border-rose-400',
      icon: 'text-rose-600',
      dot: 'bg-rose-600',
    },
  },
  violet: {
    subtle: {
      container: 'bg-violet-100 text-violet-950 border-violet-300 shadow-2xs',
      icon: 'text-violet-600',
      dot: 'bg-violet-500',
    },
    solid: {
      container: 'bg-violet-600 text-white border-violet-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-violet-800 border-violet-400',
      icon: 'text-violet-600',
      dot: 'bg-violet-600',
    },
  },
  cyan: {
    subtle: {
      container: 'bg-cyan-100 text-cyan-950 border-cyan-300 shadow-2xs',
      icon: 'text-cyan-700',
      dot: 'bg-cyan-500',
    },
    solid: {
      container: 'bg-cyan-600 text-white border-cyan-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-cyan-900 border-cyan-400',
      icon: 'text-cyan-700',
      dot: 'bg-cyan-500',
    },
  },
  slate: {
    subtle: {
      container: 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs',
      icon: 'text-slate-500',
      dot: 'bg-slate-400',
    },
    solid: {
      container: 'bg-slate-600 text-white border-slate-600 shadow-2xs',
      icon: 'text-white',
      dot: 'bg-white',
    },
    outline: {
      container: 'bg-white text-slate-700 border-slate-300',
      icon: 'text-slate-500',
      dot: 'bg-slate-400',
    },
  },
}

const SIZE_STYLES: Record<BadgeSize, { badge: string; icon: number; dot: string }> = {
  sm: {
    badge: 'px-1.5 py-0.5 text-[10px]',
    icon: 10,
    dot: 'w-1.5 h-1.5',
  },
  md: {
    badge: 'px-2 py-0.5 text-[11px]',
    icon: 11,
    dot: 'w-1.5 h-1.5',
  },
  lg: {
    badge: 'px-2.5 py-1 text-xs',
    icon: 13,
    dot: 'w-2 h-2',
  },
}

export interface StatusBadgeProps {
  status?: string
  label?: string
  tone?: BadgeTone
  icon?: LucideIcon
  showIcon?: boolean
  showDot?: boolean
  showChevron?: boolean
  chevronOpen?: boolean
  interactive?: boolean
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  title?: string
}

export function StatusBadge({
  status,
  label: customLabel,
  tone: customTone,
  icon: customIcon,
  showIcon = true,
  showDot = false,
  showChevron = false,
  chevronOpen = false,
  interactive = false,
  variant = 'subtle',
  size = 'md',
  className = '',
  onClick,
  title,
}: StatusBadgeProps) {
  const config = status ? (SYSTEM_STATUS_CONFIGS[status] || SYSTEM_STATUS_CONFIGS[status.toUpperCase()]) : undefined

  const finalTone: BadgeTone = customTone ?? config?.tone ?? 'slate'
  const finalLabel = customLabel ?? config?.label ?? status ?? ''
  const IconComponent = customIcon ?? config?.icon
  const toneStyle = TONE_STYLES[finalTone][variant]
  const sizeStyle = SIZE_STYLES[size]

  const isClickable = Boolean(onClick || interactive)

  const commonClasses = `inline-flex items-center gap-1 font-semibold rounded-full border tracking-wide shrink-0 select-none transition-all ${
    toneStyle.container
  } ${sizeStyle.badge} ${
    isClickable
      ? 'cursor-pointer hover:brightness-95 hover:shadow-2xs active:scale-95'
      : ''
  } ${className}`

  const content = (
    <>
      {showDot && (
        <span
          className={`rounded-full shrink-0 ${sizeStyle.dot} ${toneStyle.dot}`}
          aria-hidden="true"
        />
      )}
      {showIcon && IconComponent && (
        <IconComponent
          size={sizeStyle.icon}
          className={`shrink-0 ${toneStyle.icon}`}
          aria-hidden="true"
        />
      )}
      <span>{finalLabel}</span>
      {showChevron && (
        <ChevronDown
          size={size === 'lg' ? 12 : 10}
          className={`shrink-0 opacity-60 transition-transform duration-150 ${
            chevronOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={commonClasses}
      >
        {content}
      </button>
    )
  }

  return (
    <span
      title={title}
      className={commonClasses}
    >
      {content}
    </span>
  )
}
