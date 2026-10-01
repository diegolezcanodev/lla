'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { UserResponseDTO } from '../types/user'

export interface MenuItem {
  url: string
  nombre: string
}

interface AuthContextValue {
  user: UserResponseDTO
  menus: MenuItem[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function UserProvider({
  user,
  menus,
  children,
}: {
  user: UserResponseDTO
  menus: MenuItem[]
  children: ReactNode
}) {
  return <AuthContext.Provider value={{ user, menus }}>{children}</AuthContext.Provider>
}

export function useUser(): UserResponseDTO {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx.user
}

export function useMenus(): MenuItem[] {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useMenus must be used within a UserProvider')
  return ctx.menus
}
