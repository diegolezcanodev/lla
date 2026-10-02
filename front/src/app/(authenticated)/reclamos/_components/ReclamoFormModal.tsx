"use client"

import { useEffect, useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { TextareaField } from "../../../../components/TextareaField"
import { Select } from "../../../../components/Select"
import { createReclamo, updateReclamo } from "../../../../actions/reclamo"
import { getAllBarriosActivos } from "../../../../services/barrios"
import { getEquipo } from "../../../../services/equipo"
import { createReclamoSchema, updateReclamoSchema } from "../../../../lib/validation"
import type { ReclamoResponseDTO, CreateReclamoDTO, UpdateReclamoDTO, CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "../../../../types/reclamo"
import type { BarrioResponseDTO } from "../../../../types/barrio"
import type { MiembroEquipoResponseDTO } from "../../../../types/equipo"

interface ReclamoFormModalProps {
  reclamo?: ReclamoResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIA_OPTIONS = [
  { value: "ALUMBRADO", label: "Alumbrado Público" },
  { value: "PAVIMENTO", label: "Baches / Pavimento" },
  { value: "AGUA", label: "Agua Corriente" },
  { value: "CLOACAS", label: "Cloacas / Desagües" },
  { value: "LIMPIEZA", label: "Higiene / Basurales" },
  { value: "SEGURIDAD", label: "Seguridad / Iluminación" },
  { value: "TRANSPORTE", label: "Transporte / Paradas" },
  { value: "SALUD", label: "Salud / Dispensario" },
  { value: "OTRO", label: "Otro" },
]

const ESTADO_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "RECHAZADO", label: "Rechazado" },
]

const PRIORIDAD_OPTIONS = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
]

export function ReclamoFormModal({ reclamo, onClose, onSuccess }: ReclamoFormModalProps) {
  const isEdit = !!reclamo
  const schema = isEdit ? updateReclamoSchema : createReclamoSchema
  const [barrios, setBarrios] = useState<BarrioResponseDTO[]>([])
  const [miembros, setMiembros] = useState<MiembroEquipoResponseDTO[]>([])
  const [barrioId, setBarrioId] = useState<string>(reclamo?.barrioId ? String(reclamo.barrioId) : "")
  const [categoria, setCategoria] = useState<string>(reclamo?.categoria || "ALUMBRADO")
  const [estado, setEstado] = useState<string>(reclamo?.estado || "PENDIENTE")
  const [prioridad, setPrioridad] = useState<string>(reclamo?.prioridad || "MEDIA")
  const [asignadoAId, setAsignadoAId] = useState<string>(reclamo?.asignadoAId ? String(reclamo.asignadoAId) : "")

  useEffect(() => {
    getAllBarriosActivos().then(setBarrios).catch(() => {})
    getEquipo(1, 100).then((res) => setMiembros(res.data)).catch(() => {})
  }, [])

  async function onSubmitAction(values: Record<string, any>) {
    values.categoria = categoria
    values.estado = estado
    values.prioridad = prioridad
    if (isEdit) {
      return updateReclamo(reclamo!.id, values as unknown as UpdateReclamoDTO)
    }
    return createReclamo(values as unknown as CreateReclamoDTO)
  }

  const barrioOptions = [
    { value: "", label: "Sin barrio asignado" },
    ...barrios.map((b) => ({ value: String(b.id), label: b.nombre })),
  ]

  const miembroOptions = [
    { value: "", label: "Sin miembro asignado" },
    ...miembros.map((m) => ({ value: String(m.id), label: `${m.nombre} ${m.apellido}` })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar reclamo vecinal" : "Nuevo reclamo vecinal"}
      subtitle="Registrá la inquietud del vecino para su seguimiento territorial"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Registrar reclamo"}
      successMessage={isEdit ? "Reclamo actualizado" : "Reclamo registrado"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputField
                id="vecino"
                label="Nombre del Vecino *"
                required
                placeholder="Ej: Laura Gomez"
                defaultValue={reclamo?.vecino}
                error={fieldErrors?.vecino?.[0]}
              />
            </div>
            <InputField
              id="telefono"
              label="Teléfono / Celular"
              placeholder="Ej: 341-6123456"
              defaultValue={reclamo?.telefono ?? ""}
              error={fieldErrors?.telefono?.[0]}
            />
          </div>

          <InputField
            id="titulo"
            label="Título o Motivo del Reclamo *"
            required
            placeholder="Ej: Falta de luminaria en la plaza central"
            defaultValue={reclamo?.titulo}
            error={fieldErrors?.titulo?.[0]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="direccion"
              label="Dirección o Esquina exacta"
              placeholder="Ej: Corrientes y Rioja"
              defaultValue={reclamo?.direccion ?? ""}
              error={fieldErrors?.direccion?.[0]}
            />

            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio"
              options={barrioOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="categoria"
              name="categoria"
              label="Categoría"
              options={CATEGORIA_OPTIONS}
              value={categoria}
              onChange={setCategoria}
              error={fieldErrors?.categoria?.[0]}
            />

            <Select
              id="prioridad"
              name="prioridad"
              label="Prioridad"
              options={PRIORIDAD_OPTIONS}
              value={prioridad}
              onChange={setPrioridad}
              error={fieldErrors?.prioridad?.[0]}
            />

            <Select
              id="estado"
              name="estado"
              label="Estado"
              options={ESTADO_OPTIONS}
              value={estado}
              onChange={setEstado}
              error={fieldErrors?.estado?.[0]}
            />
          </div>

          <TextareaField
            id="descripcion"
            label="Detalle del Reclamo *"
            required
            rows={5}
            placeholder="Descripción precisa y extensa de la problemática planteada por el vecino..."
            defaultValue={reclamo?.descripcion}
            error={fieldErrors?.descripcion?.[0]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="asignadoAId"
              name="asignadoAId"
              label="Asignar seguimiento a miembro"
              options={miembroOptions}
              value={asignadoAId}
              onChange={setAsignadoAId}
              error={fieldErrors?.asignadoAId?.[0]}
            />

            <InputField
              id="respuesta"
              label="Respuesta o Resolución"
              placeholder="Acción tomada, fecha de resolución o derivación..."
              defaultValue={reclamo?.respuesta ?? ""}
              error={fieldErrors?.respuesta?.[0]}
            />
          </div>
        </>
      )}
    </CrudFormModal>
  )
}
