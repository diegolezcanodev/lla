"use client"

import { useEffect, useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { Select } from "../../../../components/Select"
import { Toggle } from "../../../../components/Toggle"
import { createStakeholder, updateStakeholder } from "../../../../actions/stakeholder"
import { getAllBarriosActivos } from "../../../../services/barrios"
import { createStakeholderSchema, updateStakeholderSchema } from "../../../../lib/validation"
import type { StakeholderResponseDTO, CreateStakeholderDTO, UpdateStakeholderDTO } from "../../../../types/stakeholder"
import type { BarrioResponseDTO } from "../../../../types/barrio"

interface StakeholderFormModalProps {
  stakeholder?: StakeholderResponseDTO
  onClose: () => void
  onSuccess: () => void
}

export function StakeholderFormModal({ stakeholder, onClose, onSuccess }: StakeholderFormModalProps) {
  const isEdit = !!stakeholder
  const schema = isEdit ? updateStakeholderSchema : createStakeholderSchema
  const [barrios, setBarrios] = useState<BarrioResponseDTO[]>([])
  const [barrioId, setBarrioId] = useState<string>(stakeholder?.barrioId ? String(stakeholder.barrioId) : "")
  const [esAliado, setEsAliado] = useState<boolean>(stakeholder?.esAliado ?? false)
  const [influencia, setInfluencia] = useState<number>(stakeholder?.nivelInfluencia ?? 5)

  useEffect(() => {
    getAllBarriosActivos().then(setBarrios).catch(() => {})
  }, [])

  async function onSubmitAction(values: Record<string, any>) {
    values.esAliado = esAliado
    values.nivelInfluencia = influencia
    if (isEdit) {
      return updateStakeholder(stakeholder!.id, values as unknown as UpdateStakeholderDTO)
    }
    return createStakeholder(values as unknown as CreateStakeholderDTO)
  }

  const barrioOptions = [
    { value: "", label: "General / Sin barrio específico" },
    ...barrios.map((b) => ({ value: String(b.id), label: b.nombre })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar actor clave" : "Nuevo actor clave"}
      subtitle="Definí el referente, su institución y nivel de relación"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear actor"}
      successMessage={isEdit ? "Actor clave actualizado" : "Actor clave creado"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="nombre"
              label="Nombre *"
              required
              placeholder="Ej: Marcelo"
              defaultValue={stakeholder?.nombre}
              error={fieldErrors?.nombre?.[0]}
            />

            <InputField
              id="apellido"
              label="Apellido *"
              required
              placeholder="Ej: Rossi"
              defaultValue={stakeholder?.apellido}
              error={fieldErrors?.apellido?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="cargo"
              label="Cargo o Rol"
              placeholder="Ej: Presidente, Tesorero, Párroco"
              defaultValue={stakeholder?.cargo ?? ""}
              error={fieldErrors?.cargo?.[0]}
            />

            <InputField
              id="organizacion"
              label="Organización o Ámbito"
              placeholder="Ej: Cámara de Comercio, Club Social"
              defaultValue={stakeholder?.organizacion ?? ""}
              error={fieldErrors?.organizacion?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              id="telefono"
              label="Teléfono"
              placeholder="Ej: 341-5551234"
              defaultValue={stakeholder?.telefono ?? ""}
              error={fieldErrors?.telefono?.[0]}
            />

            <InputField
              id="email"
              label="Email"
              placeholder="marcelo@correo.com"
              defaultValue={stakeholder?.email ?? ""}
              error={fieldErrors?.email?.[0]}
            />

            <InputField
              id="instagram"
              label="Instagram"
              placeholder="@usuario"
              defaultValue={stakeholder?.instagram ?? ""}
              error={fieldErrors?.instagram?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio / Zona territorial"
              options={barrioOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />

            <InputField
              id="fechaUltimoContacto"
              type="date"
              label="Fecha Último Contacto"
              defaultValue={
                stakeholder?.fechaUltimoContacto || new Date().toISOString().slice(0, 10)
              }
              error={fieldErrors?.fechaUltimoContacto?.[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nivel de Influencia Política (1 al 10): <span className="font-bold text-accent">{influencia}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={influencia}
              onChange={(e) => setInfluencia(Number(e.target.value))}
              className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-tertiary mt-1">
              <span>Baja (1)</span>
              <span>Moderada (5)</span>
              <span>Estratégica / Muy Alta (10)</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-white">
            <div>
              <p className="text-sm font-medium text-text-secondary">¿Es Aliado estratégico permanente?</p>
              <p className="text-xs text-text-tertiary">
                Si es Aliado, su estado en el CRM figurará siempre como Aliado sin importar los días transcurridos
              </p>
            </div>
            <Toggle checked={esAliado} onChange={setEsAliado} label="Es Aliado" />
          </div>

          <InputField
            id="observaciones"
            label="Observaciones y antecedentes"
            placeholder="Intereses, alineación política previa, detalles personales..."
            defaultValue={stakeholder?.observaciones ?? ""}
            error={fieldErrors?.observaciones?.[0]}
          />
        </>
      )}
    </CrudFormModal>
  )
}
