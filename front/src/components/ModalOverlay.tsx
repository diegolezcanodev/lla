'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalOverlayProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  /** Clase de z-index del contenedor (ej. 'z-[70]'). */
  zIndexClassName?: string
  /** Color del velo (ej. 'bg-black/40'). */
  backdropClassName?: string
  /** Cerrar al hacer click en el fondo. Por defecto NO (los modales se cierran con sus botones). */
  closeOnBackdrop?: boolean
  /** Cerrar con la tecla Escape. */
  closeOnEscape?: boolean
}

/**
 * Contenedor estándar para todos los modales:
 * portal a body + velo con blur + cierre por backdrop/Escape.
 *
 * OJO: el contenedor NO debe tener animación de `opacity` (ni `transform`/`filter`),
 * porque crea un "backdrop root" y rompe el `backdrop-filter` (el velo deja de
 * blurrear la página). La animación va SOLO en la tarjeta (animate-card-in).
 *
 * Por defecto los modales NO se cierran al clickear afuera (closeOnBackdrop=false),
 * para evitar cierres accidentales que hagan perder datos de formularios.
 */
export function ModalOverlay({
  open,
  onClose,
  children,
  zIndexClassName = 'z-[70]',
  backdropClassName = 'bg-black/40',
  closeOnBackdrop = false,
  closeOnEscape = true,
}: ModalOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !closeOnEscape || !onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeOnEscape, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center p-4`}>
      <div
        className={`fixed inset-0 ${backdropClassName} backdrop-blur-md`}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      {children}
    </div>,
    document.body,
  )
}
