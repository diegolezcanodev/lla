'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getMe, logout } from '../../../services/auth'
import { UserProvider } from '../../../context/AuthContext'
import { Sidebar } from './Sidebar'
import { Spinner } from '../../../components/Spinner'
import { PageSkeleton } from '../../../components/PageSkeleton'
import type { MenuItem } from '../../../context/AuthContext'
import type { UserResponseDTO } from '../../../types/user'

const ADMIN_MENUS: MenuItem[] = [
  { url: '/dashboard', nombre: 'Dashboard' },
  { url: '/equipo', nombre: 'Equipo' },
  { url: '/barrios', nombre: 'Barrios' },
  { url: '/empresas', nombre: 'Empresas' },
  { url: '/stakeholders', nombre: 'Actores Clave' },
  { url: '/escuelas', nombre: 'Escuelas' },
  { url: '/reclamos', nombre: 'Reclamos' },
  { url: '/oposicion', nombre: 'Oposición' },
  { url: '/tareas', nombre: 'Tareas' },
  { url: '/usuarios', nombre: 'Usuarios' },
]

const DEFAULT_MENUS: MenuItem[] = [
  { url: '/dashboard', nombre: 'Dashboard' },
  { url: '/reclamos', nombre: 'Reclamos' },
  { url: '/tareas', nombre: 'Tareas' },
]

function menusFor(roles: string[]): MenuItem[] {
  return roles.includes('Administrador') ? ADMIN_MENUS : DEFAULT_MENUS
}

const SKELETON_DELAY_MS = 150

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [navTarget, setNavTarget] = useState<string | null>(null)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [isExitingSkeleton, setIsExitingSkeleton] = useState(false)
  const showSkeletonRef = useRef(false)
  const mainRef = useRef<HTMLElement>(null)

  const isNavigating = Boolean(navTarget && navTarget !== pathname)
  const renderSkeleton = showSkeleton || isExitingSkeleton

  function handleNavigate(href: string) {
    if (href === pathname) return
    setIsExitingSkeleton(false)
    showSkeletonRef.current = false
    setShowSkeleton(false)
    setNavTarget(href)
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    router.push(href)
  }

  useEffect(() => {
    if (showSkeletonRef.current) {
      showSkeletonRef.current = false
      setIsExitingSkeleton(true)
      const timer = setTimeout(() => {
        setIsExitingSkeleton(false)
        setShowSkeleton(false)
      }, 200)
      setNavTarget(null)
      return () => clearTimeout(timer)
    } else {
      setNavTarget(null)
      showSkeletonRef.current = false
      setShowSkeleton(false)
      setIsExitingSkeleton(false)
    }
  }, [pathname])

  useEffect(() => {
    if (!isNavigating) {
      showSkeletonRef.current = false
      setShowSkeleton(false)
      return
    }

    const timer = setTimeout(() => {
      showSkeletonRef.current = true
      setShowSkeleton(true)
    }, SKELETON_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isNavigating])

  useEffect(() => {
    if (!navTarget) return
    const timer = setTimeout(() => {
      setNavTarget(null)
      setShowSkeleton(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [navTarget])

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const result = await getMe()
        if (!mounted) return
        if (!result) {
          await logout().catch(() => {})
          window.location.href = '/'
          return
        }
        setUser(result.user)
      } catch {
        if (mounted) {
          await logout().catch(() => {})
          window.location.href = '/'
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <UserProvider user={user} menus={menusFor(user.roles)}>
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onNavigate={handleNavigate}
        navTarget={navTarget}
      />
      <main
        ref={mainRef}
        className={`relative h-screen bg-bg-secondary pt-14 lg:pt-0 flex flex-col overflow-y-auto transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[max(240px,20vw)]'
        }`}
      >
        <div
          key={pathname}
          className={`flex-1 flex flex-col min-h-0 ${
            isNavigating ? 'hidden' : 'animate-page-enter'
          }`}
        >
          {children}
        </div>

        {renderSkeleton && (
          <div
            className={`absolute inset-x-0 bottom-0 top-14 lg:top-0 flex flex-col bg-bg-secondary z-20 pointer-events-none ${
              isExitingSkeleton ? 'animate-skeleton-out' : 'animate-skeleton-fade'
            }`}
          >
            <PageSkeleton path={navTarget ?? pathname} />
          </div>
        )}
      </main>
    </UserProvider>
  )
}
