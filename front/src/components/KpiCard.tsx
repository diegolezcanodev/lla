import type { ReactNode } from 'react'

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'

const toneClasses: Record<Tone, string> = {
  accent: 'border-l-accent',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
  info: 'border-l-info',
  secondary: 'border-l-secondary',
}

interface KpiCardProps {
  label: string
  value: ReactNode
  sub?: string
  tone?: Tone
}

export function KpiCard({ label, value, sub, tone = 'accent' }: KpiCardProps) {
  return (
    <div className={`rounded-lg border border-border border-l-4 bg-bg p-5 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium text-text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-tertiary">{sub}</p>}
    </div>
  )
}