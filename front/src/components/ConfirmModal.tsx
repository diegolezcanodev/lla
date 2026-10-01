'use client'

import { useCallback } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { AsyncButton } from './AsyncButton'
import { SmoothHeight } from './SmoothHeight'
import { ModalOverlay } from './ModalOverlay'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'success' | 'secondary'
  icon?: boolean
  onConfirm: () => void
  onClose?: () => void
  onCancel?: () => void
  loading?: boolean
  overlayClassName?: string
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  icon = false,
  onConfirm,
  onClose,
  onCancel,
  loading = false,
  overlayClassName = 'z-[80]',
}: ConfirmModalProps) {
  const handleClose = useCallback(() => {
    if (onCancel) onCancel()
    else if (onClose) onClose()
  }, [onCancel, onClose])

  if (!open) return null

  return (
    <ModalOverlay open={open} onClose={handleClose} zIndexClassName={overlayClassName}>
      <div
        className="relative bg-white rounded-2xl border border-border shadow-2xl p-6 w-full max-w-md mx-4 animate-card-in z-10"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  variant === 'danger'
                    ? 'bg-danger-light text-danger'
                    : 'bg-warning-light text-warning'
                }`}
              >
                <AlertTriangle size={18} />
              </div>
            )}
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <SmoothHeight className="mb-6">
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </SmoothHeight>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-secondary transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <AsyncButton
            loading={loading}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            className="px-5 py-2 text-sm"
          >
            {confirmLabel}
          </AsyncButton>
        </div>
      </div>
    </ModalOverlay>
  )
}