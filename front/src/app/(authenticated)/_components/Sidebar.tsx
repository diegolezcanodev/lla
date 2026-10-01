'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Users,
  Sparkles,
} from 'lucide-react'
import { logout } from '../../../services/auth'
import { SidebarLink } from './SidebarLink'
import { useMenus } from '../../../context/AuthContext'
import type { UserResponseDTO } from '../../../types/user'

interface SidebarProps {
  user: UserResponseDTO
  collapsed?: boolean
  onToggle?: () => void
  onNavigate?: (href: string) => void
  navTarget?: string | null
  isNavigating?: boolean
}

export function Sidebar({
  user,
  collapsed = false,
  onToggle,
  onNavigate,
  navTarget = null,
}: SidebarProps) {
  const menus = useMenus()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (toggleRef.current?.contains(target) || dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const menuIcons: Record<string, React.ReactNode> = {
    '/dashboard': <LayoutDashboard size={20} />,
    '/usuarios': <Users size={20} />,
  }

  function getMenuIcon(url: string): React.ReactNode {
    return (
      menuIcons[url] ?? (
        <span className="text-xl leading-none w-[20px] text-center">
          {url.charAt(1).toUpperCase()}
        </span>
      )
    )
  }

  function isActive(url: string): boolean {
    if (navTarget) return navTarget === url
    return pathname === url
  }

  return (
    <>
      {/* Mobile: full-width top bar + dropdown */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 shadow-md">
        <button
          ref={toggleRef}
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-4 h-14 bg-secondary text-white"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white text-xs font-bold shrink-0">
              {user?.nombre?.charAt(0)}
              {user?.apellido?.charAt(0)}
            </div>
            <span className="text-sm font-medium truncate">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
          <ChevronDown
            size={20}
            className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          ref={dropdownRef}
          className={`grid transition-[grid-template-rows] duration-200 ease-out bg-secondary ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden shadow-lg">
            <nav className="px-3 py-2 border-t border-white/10">
              <ul className="space-y-0.5">
                {menus.map((item) => (
                  <SidebarLink
                    key={item.url}
                    href={item.url}
                    icon={getMenuIcon(item.url)}
                    label={item.nombre}
                    onClick={() => {
                      setOpen(false)
                      onNavigate?.(item.url)
                    }}
                  />
                ))}
              </ul>
            </nav>
            <div className="px-3 py-3 border-t border-white/10 space-y-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-full flex-col overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-[max(240px,20vw)]'
        }`}
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        {/* Floating collapse/expand handle */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir menú' : 'Comprimir menú'}
          aria-label={collapsed ? 'Expandir menú' : 'Comprimir menú'}
          style={{ left: collapsed ? 72 : 'max(240px, 20vw)' }}
          className="fixed top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] hidden lg:flex
                     w-7 h-7 rounded-full bg-white text-secondary shadow-md
                     items-center justify-center hover:scale-110
                     transition-[left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo header */}
        <div className="relative z-10 flex items-center justify-center py-4 border-b border-white/10">
          <Link href="/dashboard" aria-label="Ir al inicio" className="cursor-pointer flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <span
              className={`font-display font-bold tracking-[0.2em] text-white
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${collapsed ? 'max-w-0 opacity-0 -ml-3 overflow-hidden' : 'max-w-[180px] opacity-100 text-xl'}`}
            >
              LLA
            </span>
          </Link>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {menus.map((item) => (
              <SidebarLink
                key={item.url}
                href={item.url}
                icon={getMenuIcon(item.url)}
                label={item.nombre}
                collapsed={collapsed}
                active={isActive(item.url)}
                onClick={() => onNavigate?.(item.url)}
              />
            ))}
          </ul>
        </nav>

        {/* Usuario & Logout */}
        <div className="relative z-10 px-4 py-5 border-t border-white/10 space-y-3">
          <div
            className={`flex items-center gap-3 rounded-xl
            transition-[padding-left,padding-right,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${collapsed ? 'bg-transparent pl-0 pr-0 py-2' : 'bg-white/5 pl-4 pr-4 py-3'}`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent-light text-sm font-bold shrink-0 border border-accent/30">
              {user?.nombre?.charAt(0)}
              {user?.apellido?.charAt(0)}
            </div>
            <div
              className={`min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'
              }`}
            >
              <p className="text-sm font-semibold text-white truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`flex w-full items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-white/70
              hover:bg-white/10 hover:text-white
              transition-[padding-left,padding-right,background-color,color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${collapsed ? 'pl-2.5 pr-2.5' : 'pl-4 pr-4'}`}
          >
            <LogOut size={18} className="shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'
              }`}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
