"use client"

import { useEffect, useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { Select } from "../../../../components/Select"
import { Toggle } from "../../../../components/Toggle"
import { createEmpresa, updateEmpresa } from "../../../../actions/empresa"
import { getAllBarriosActivos } from "../../../../services/barrios"
import { createEmpresaSchema, updateEmpresaSchema } from "../../../../lib/validation"
import type { EmpresaResponseDTO, CreateEmpresaDTO, UpdateEmpresaDTO, TamanoEmpresa } from "../../../../types/empresa"
import type { BarrioResponseDTO } from "../../../../types/barrio"

interface EmpresaFormModalProps {
  empresa?: EmpresaResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const TAMANO_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "MICRO", label: "Microempresa" },
  { value: "PEQUENA", label: "Pequeña" },
  { value: "MEDIANA", label: "Mediana" },
  { value: "GRANDE", label: "Grande" },
]

export function EmpresaFormModal({ empresa, onClose, onSuccess }: EmpresaFormModalProps) {
  const isEdit = !!empresa
  const schema = isEdit ? updateEmpresaSchema : createEmpresaSchema
  const [barrios, setBarrios] = useState<BarrioResponseDTO[]>([])
  const [barrioId, setBarrioId] = useState<string>(empresa ? String(empresa.barrioId) : "")
  const [tamano, setTamano] = useState<string>(empresa?.tamano || "")

  useEffect(() => {
    getAllBarriosActivos().then(setBarrios).catch(() => {})
  }, [])

  async function onSubmitAction(values: Record<string, any>) {
    if (isEdit) {
      return updateEmpresa(empresa!.id, values as unknown as UpdateEmpresaDTO)
    }
    return createEmpresa(values as unknown as CreateEmpresaDTO)
  }

  const barrioOptions = [
    { value: "", label: "Seleccioná un barrio..." },
    ...barrios.map((b) => ({ value: String(b.id), label: b.nombre })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar empresa" : "Nueva empresa"}
      subtitle="Registrá los datos clave de la empresa o comercio de la ciudad"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear empresa"}
      successMessage={isEdit ? "Empresa actualizada" : "Empresa creada"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <InputField
            id="nombre"
            label="Nombre o Razón Social"
            required
            placeholder="Ej: Distribuidora Central S.A."
            defaultValue={empresa?.nombre}
            error={fieldErrors?.nombre?.[0]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="direccion"
              label="Dirección"
              required
              placeholder="Ej: Av. San Martín 1420"
              defaultValue={empresa?.direccion}
              error={fieldErrors?.direccion?.[0]}
            />

            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio / Zona *"
              options={barrioOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="rubro"
              label="Rubro o Actividad"
              placeholder="Ej: Metalúrgica, Alimentos, Textil..."
              defaultValue={empresa?.rubro ?? ""}
              error={fieldErrors?.rubro?.[0]}
            />

            <Select
              id="tamano"
              name="tamano"
              label="Tamaño de Empresa"
              options={TAMANO_OPTIONS}
              value={tamano}
              onChange={setTamano}
              error={fieldErrors?.tamano?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              id="cuit"
              label="CUIT"
              placeholder="Ej: 30-12345678-9"
              defaultValue={empresa?.cuit ?? ""}
              error={fieldErrors?.cuit?.[0]}
            />

            <InputField
              id="telefono"
              label="Teléfono"
              placeholder="Ej: 341-4567890"
              defaultValue={empresa?.telefono ?? ""}
              error={fieldErrors?.telefono?.[0]}
            />

            <InputField
              id="email"
              label="Email"
              placeholder="contacto@empresa.com"
              defaultValue={empresa?.email ?? ""}
              error={fieldErrors?.email?.[0]}
            />
          </div>

          <InputField
            id="contactoPrincipal"
            label="Referente o Contacto Principal"
            placeholder="Nombre y cargo de la persona de contacto"
            defaultValue={empresa?.contactoPrincipal ?? ""}
            error={fieldErrors?.contactoPrincipal?.[0]}
          />

          <InputField
            id="observaciones"
            label="Observaciones"
            placeholder="Notas sobre relación con el espacio, historial, etc."
            defaultValue={empresa?.observaciones ?? ""}
            error={fieldErrors?.observaciones?.[0]}
          />

          {isEdit && <EstadoField initial={empresa?.activa ?? true} />}
        </>
      )}
    </CrudFormModal>
  )
}

function EstadoField({ initial }: { initial: boolean }) {
  const [activa, setActiva] = useState(initial)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-secondary">Estado de la empresa</p>
        <p className="text-xs text-text-tertiary">Permite dar de baja o archivar empresas inactivas</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{activa ? "Activa" : "Inactiva"}</span>
        <input type="hidden" name="activa" value={String(activa)} />
        <Toggle checked={activa} onChange={setActiva} label="Estado de la empresa" />
      </div>
    </div>
  )
}
