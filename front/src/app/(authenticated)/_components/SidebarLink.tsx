'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  href: string
  icon: ReactNode
  label: string
  collapsed?: boolean
  onClick?: () => void
  active?: boolean
}

export function SidebarLink({
  href,
  icon,
  label,
  collapsed = false,
  onClick,
  active = false,
}: Props) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute -left-1 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
      <Link
        href={href}
        title={collapsed ? label : undefined}
        onClick={(e) => {
          e.preventDefault()
          onClick?.()
        }}
        className={`flex items-center gap-3 py-3 rounded-lg text-[15px] font-medium
          transition-[padding-left,padding-right,background-color,color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? 'pl-2.5 pr-2.5' : 'pl-4 pr-4'}
          ${active ? 'text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
        style={
          active
            ? { backgroundColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)' }
            : undefined
        }
      >
        <span className="shrink-0" style={active ? { color: 'var(--color-accent)' } : undefined}>
          {icon}
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'
          }`}
        >
          {label}
        </span>
      </Link>
    </li>
  )
}
