'use client'

import { useState, useEffect } from 'react'
import { CrudFormModal } from '../../../../components/CrudFormModal'
import { InputField } from '../../../../components/InputField'
import { Select } from '../../../../components/Select'
import { Toggle } from '../../../../components/Toggle'
import { createMiembroEquipo, updateMiembroEquipo } from '../../../../actions/equipo'
import { getAllBarriosActivos } from '../../../../services/barrios'
import { createEquipoSchema, updateEquipoSchema } from '../../../../lib/validation'
import type {
  MiembroEquipoResponseDTO,
  CreateMiembroEquipoDTO,
  UpdateMiembroEquipoDTO,
  TipoMiembro,
} from '../../../../types/equipo'
import { UserCheck, Info, KeyRound } from 'lucide-react'

interface EquipoFormModalProps {
  miembro?: MiembroEquipoResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const TIPO_OPTIONS = [
  { value: 'EQUIPO', label: 'Equipo' },
  { value: 'ESTRATEGIA', label: 'Estrategia' },
  { value: 'FISCAL', label: 'Fiscal' },
  { value: 'VECINO', label: 'Vecino' },
]

export function EquipoFormModal({ miembro, onClose, onSuccess }: EquipoFormModalProps) {
  const isEdit = !!miembro
  const schema = isEdit ? updateEquipoSchema : createEquipoSchema
  const [tipo, setTipo] = useState<TipoMiembro>(miembro?.tipo ?? 'EQUIPO')
  const [barrioId, setBarrioId] = useState<string>(miembro?.barrioId ? String(miembro.barrioId) : '')
  const [barriosOptions, setBarriosOptions] = useState<{ value: string; label: string }[]>([])
  const [emailValue, setEmailValue] = useState<string>(miembro?.email ?? '')

  useEffect(() => {
    getAllBarriosActivos()
      .then((list) => {
        setBarriosOptions(list.map((b) => ({ value: String(b.id), label: b.nombre })))
      })
      .catch(() => setBarriosOptions([]))
  }, [])

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())
  const showCredentialCard = (tipo === 'EQUIPO' || tipo === 'ESTRATEGIA') && isValidEmail

  async function onSubmitAction(values: Record<string, any>) {
    if (isEdit) {
      return updateMiembroEquipo(miembro!.id, values as unknown as UpdateMiembroEquipoDTO)
    }
    return createMiembroEquipo(values as unknown as CreateMiembroEquipoDTO)
  }

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? 'Editar miembro del equipo' : 'Nuevo miembro del equipo'}
      subtitle="Completá la información personal, territorial y de acceso"
      schema={schema}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear miembro'}
      successMessage={isEdit ? 'Miembro actualizado correctamente' : 'Miembro creado correctamente'}
      onSubmitAction={onSubmitAction}
      className="max-w-2xl"
    >
      {({ fieldErrors }) => (
        <>
          {/* Selector de Tipo */}
          <div className="space-y-2">
            <Select
              id="tipo"
              name="tipo"
              label="Tipo de Miembro *"
              options={TIPO_OPTIONS}
              value={tipo}
              onChange={(val) => setTipo(val as TipoMiembro)}
              error={fieldErrors?.tipo?.[0]}
            />

            {(tipo === 'EQUIPO' || tipo === 'ESTRATEGIA') && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50/80 border border-violet-200/80 text-violet-800 text-xs leading-relaxed">
                <UserCheck size={16} className="shrink-0 mt-0.5 text-violet-600" />
                <div>
                  <span className="font-semibold">Tipo con opción de acceso al sistema: </span>
                  Podés vincularle una cuenta con rol{' '}
                  <span className="font-bold underline">
                    {tipo === 'EQUIPO' ? 'Equipo' : 'Estrategia'}
                  </span>{' '}
                  ingresando su email y una contraseña. Si no completás contraseña, no se le creará usuario.
                </div>
              </div>
            )}
          </div>

          {/* Datos Personales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              id="nombre"
              label="Nombre"
              required
              defaultValue={miembro?.nombre}
              error={fieldErrors?.nombre?.[0]}
            />
            <InputField
              id="apellido"
              label="Apellido"
              required
              defaultValue={miembro?.apellido}
              error={fieldErrors?.apellido?.[0]}
            />
            <InputField
              id="dni"
              label="DNI"
              placeholder="Ej: 38123456"
              defaultValue={miembro?.dni ?? ''}
              error={fieldErrors?.dni?.[0]}
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              id="telefono"
              label="Teléfono / WhatsApp"
              placeholder="Ej: 1123456789"
              defaultValue={miembro?.telefono ?? ''}
              error={fieldErrors?.telefono?.[0]}
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="contacto@ejemplo.com"
              defaultValue={emailValue}
              onChange={(val) => setEmailValue(val)}
              error={fieldErrors?.email?.[0]}
            />
            <InputField
              id="instagram"
              label="Instagram"
              placeholder="@usuario"
              defaultValue={miembro?.instagram ? `@${miembro.instagram}` : ''}
              error={fieldErrors?.instagram?.[0]}
            />
          </div>

          {/* Territorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio"
              placeholder="Seleccionar barrio..."
              options={barriosOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />
            <InputField
              id="direccion"
              label="Dirección y altura"
              placeholder="Ej: Av. Santa Fe 1234"
              defaultValue={miembro?.direccion ?? ''}
              error={fieldErrors?.direccion?.[0]}
            />
          </div>

          {/* Credenciales de Acceso (solo si tipo es EQUIPO/ESTRATEGIA y hay email válido) */}
          {showCredentialCard && (
            <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/50 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-violet-900">
                <KeyRound size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Credenciales de Acceso (Opcional)
                </h3>
              </div>
              <p className="text-xs text-text-secondary">
                Si completás una contraseña, se creará el usuario de acceso con rol{' '}
                <span className="font-semibold text-primary">{tipo === 'EQUIPO' ? 'Equipo' : 'Estrategia'}</span>.
                Si la dejás en blanco, el miembro se guardará sin acceso al sistema.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <InputField
                  id="contrasena"
                  label={isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña (opcional)'}
                  type="password"
                  placeholder={isEdit ? 'Dejar vacío para no modificar' : 'Mínimo 6 caracteres'}
                  error={fieldErrors?.contrasena?.[0]}
                />
                <InputField
                  id="nombreUsuario"
                  label="Nombre de usuario (opcional)"
                  placeholder="Automático si se deja vacío"
                  defaultValue={miembro?.usuarioEmail ? miembro.usuarioEmail.split('@')[0] : ''}
                  error={fieldErrors?.nombreUsuario?.[0]}
                />
              </div>
            </div>
          )}

          {/* Observaciones */}
          <InputField
            id="observaciones"
            label="Observaciones o notas"
            placeholder="Disponibilidad, profesión, habilidades, vehículo..."
            defaultValue={miembro?.observaciones ?? ''}
            error={fieldErrors?.observaciones?.[0]}
          />

          {isEdit && <EstadoField initial={miembro?.activo ?? true} />}
        </>
      )}
    </CrudFormModal>
  )
}

function EstadoField({ initial }: { initial: boolean }) {
  const [activo, setActivo] = useState(initial)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-secondary">Estado del miembro</p>
        <p className="text-xs text-text-tertiary">Si se desactiva, su acceso de usuario también se inhabilita</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{activo ? 'Activo' : 'Inactivo'}</span>
        <input type="hidden" name="activo" value={String(activo)} />
        <Toggle checked={activo} onChange={setActivo} label="Estado del miembro" />
      </div>
    </div>
  )
}
