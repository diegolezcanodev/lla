'use client'

import { useEffect, useState } from 'react'
import { CrudFormModal } from '../../../../components/CrudFormModal'
import { InputField } from '../../../../components/InputField'
import { Toggle } from '../../../../components/Toggle'
import { createUsuario, updateUsuario } from '../../../../actions/usuario'
import { getRoles } from '../../../../services/roles'
import { createUserSchema, updateUserSchema } from '../../../../lib/validation'
import type { RolResponseDTO } from '../../../../types/rol'
import type { UserResponseDTO, CreateUserDTO, UpdateUserDTO } from '../../../../types/user'

interface UsuarioFormModalProps {
  usuario?: UserResponseDTO
  onClose: () => void
  onSuccess: () => void
}

export function UsuarioFormModal({ usuario, onClose, onSuccess }: UsuarioFormModalProps) {
  const isEdit = !!usuario
  const schema = isEdit ? updateUserSchema : createUserSchema
  const [roles, setRoles] = useState<RolResponseDTO[]>([])

  useEffect(() => {
    getRoles().then(setRoles).catch(() => setRoles([]))
  }, [])

  async function onSubmitAction(values: Record<string, any>) {
    if (isEdit) {
      return updateUsuario(usuario!.id, values as unknown as UpdateUserDTO)
    }
    return createUsuario(values as unknown as CreateUserDTO)
  }

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      schema={schema}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear usuario'}
      successMessage={isEdit ? 'Usuario actualizado' : 'Usuario creado'}
      onSubmitAction={onSubmitAction}
      className="max-w-2xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="nombre"
              label="Nombre"
              required
              defaultValue={usuario?.nombre}
              error={fieldErrors?.nombre?.[0]}
            />
            <InputField
              id="apellido"
              label="Apellido"
              required
              defaultValue={usuario?.apellido}
              error={fieldErrors?.apellido?.[0]}
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              required
              defaultValue={usuario?.email}
              error={fieldErrors?.email?.[0]}
            />
            {isEdit && (
              <InputField
                id="nombreUsuario"
                label="Nombre de usuario"
                required
                defaultValue={usuario?.nombreUsuario ?? ''}
                error={fieldErrors?.nombreUsuario?.[0]}
              />
            )}
            <InputField
              id="contrasena"
              label={isEdit ? 'Contraseña (nueva)' : 'Contraseña'}
              type="password"
              required={!isEdit}
              placeholder={isEdit ? 'Dejalo vacío para no cambiarla' : 'Mínimo 6 caracteres'}
              error={fieldErrors?.contrasena?.[0]}
            />
          </div>

          <RolesField
            roles={roles}
            selectedNames={usuario?.roles ?? []}
            error={fieldErrors?.rolIds?.[0]}
          />

          {isEdit && <EstadoField initial={usuario?.activo ?? true} />}
        </>
      )}
    </CrudFormModal>
  )
}

function RolesField({
  roles,
  selectedNames,
  error,
}: {
  roles: RolResponseDTO[]
  selectedNames: string[]
  error?: string
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-text-secondary mb-1.5">
        Roles <span className="text-danger ml-0.5">*</span>
      </p>
      <div className={`space-y-2 rounded-lg border px-4 py-3 ${error ? 'border-danger' : 'border-border'}`}>
        {roles.length === 0 && <p className="text-xs text-text-tertiary">Cargando roles...</p>}
        {roles.map((r) => (
          <label key={r.id} className="flex cursor-pointer items-center gap-3 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="rolIds"
              value={r.id}
              defaultChecked={selectedNames.includes(r.nombre)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            {r.nombre}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

function EstadoField({ initial }: { initial: boolean }) {
  const [activo, setActivo] = useState(initial)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-secondary">Estado</p>
        <p className="text-xs text-text-tertiary">Un usuario inactivo no puede ingresar</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{activo ? 'Activo' : 'Inactivo'}</span>
        <input type="hidden" name="activo" value={String(activo)} />
        <Toggle checked={activo} onChange={setActivo} label="Estado del usuario" />
      </div>
    </div>
  )
}
