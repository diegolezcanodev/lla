import {
  object,
  string,
  number,
  array,
  pipe,
  check,
  email,
  minLength,
  maxLength,
  integer,
  minValue,
  maxValue,
  optional,
  boolean,
  transform,
  unknown,
} from 'valibot'

const clean = (v: unknown) => (v === '' || v === undefined ? undefined : v)

export const optionalField = (schema: any) =>
  optional(pipe(unknown(), transform(clean), optional(schema)))

const toBoolean = (v: unknown): boolean | undefined => {
  if (v === '' || v === undefined || v === null) return undefined
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return undefined
}

export const optionalBool = optional(pipe(unknown(), transform(toBoolean), optional(boolean())))

const toIntArray = (v: unknown): number[] | undefined => {
  if (v === '' || v === undefined || v === null) return undefined
  const arr = Array.isArray(v) ? v : [v]
  const nums = arr.map((x) => Number(x)).filter((n) => !isNaN(n))
  return nums.length > 0 ? nums : undefined
}

export const usernameSchema = pipe(
  string(),
  transform((v) => v.trim().toLowerCase()),
  minLength(4, 'Debe tener al menos 4 caracteres'),
  maxLength(30, 'Máximo 30 caracteres'),
  check((v) => /^[a-z0-9]/.test(v), 'Debe comenzar con una letra o número'),
  check((v) => /[a-z0-9]$/.test(v), 'Debe terminar con una letra o número'),
  check((v) => !v.includes('..'), 'No puede contener puntos consecutivos'),
  check((v) => /^[a-z0-9._-]+$/.test(v), 'Solo se permiten letras, números, guiones y puntos'),
)

export const createUserSchema = object({
  email: pipe(string(), email('Email inválido'), transform((v) => v.trim().toLowerCase())),
  nombreUsuario: optionalField(usernameSchema),
  contrasena: pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres'), maxLength(255)),
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  apellido: pipe(string(), minLength(1, 'El apellido es requerido'), maxLength(255)),
  rolIds: pipe(
    unknown(),
    transform(toIntArray),
    pipe(array(pipe(number(), integer(), minValue(1))), minLength(1, 'Al menos un rol es requerido')),
  ),
})

export const updateUserSchema = object({
  email: optionalField(pipe(string(), email('Email inválido'), transform((v) => v.trim().toLowerCase()))),
  nombreUsuario: pipe(
    string('El nombre de usuario es requerido'),
    minLength(1, 'El nombre de usuario es requerido'),
    usernameSchema,
  ),
  contrasena: optionalField(pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres'))),
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  apellido: optionalField(pipe(string(), minLength(1), maxLength(255))),
  rolIds: optional(
    pipe(
      unknown(),
      transform(toIntArray),
      optional(pipe(array(pipe(number(), integer(), minValue(1))), minLength(1, 'Al menos un rol es requerido'))),
    ),
  ),
  activo: optionalBool,
})

const toTagsArray = (v: unknown): string[] => {
  if (v === '' || v === undefined || v === null) return []
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean)
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

export const tagsField = optional(pipe(unknown(), transform(toTagsArray), array(string())))

const toNumberArray = (v: unknown): number[] | undefined => {
  if (v === '' || v === undefined || v === null) return undefined
  if (Array.isArray(v)) {
    return v.map(Number).filter((n) => !isNaN(n) && n > 0)
  }
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !isNaN(n) && n > 0)
    } catch {}
    return v.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)
  }
  return undefined
}

export const optionalNumArray = optional(pipe(unknown(), transform(toNumberArray), optional(array(number()))))

export const createBarrioSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  codigo: optionalField(pipe(string(), maxLength(10))),
  color: optionalField(pipe(string(), maxLength(20))),
  prioridad: optionalField(pipe(string(), check((v) => ['ALTA', 'MEDIA', 'BAJA', 'EN_DISPUTA'].includes(v), 'Prioridad inválida'))),
  descripcion: optionalField(pipe(string())),
  observaciones: optionalField(pipe(string())),
  tags: tagsField,
})

export const updateBarrioSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  codigo: optionalField(pipe(string(), maxLength(10))),
  color: optionalField(pipe(string(), maxLength(20))),
  prioridad: optionalField(pipe(string(), check((v) => ['ALTA', 'MEDIA', 'BAJA', 'EN_DISPUTA'].includes(v), 'Prioridad inválida'))),
  descripcion: optionalField(pipe(string())),
  observaciones: optionalField(pipe(string())),
  tags: tagsField,
  activo: optionalBool,
})

const toOptNumber = (v: unknown): number | undefined => {
  if (v === '' || v === undefined || v === null) return undefined
  const n = Number(v)
  return isNaN(n) ? undefined : n
}

export const optionalNum = optional(pipe(unknown(), transform(toOptNumber), optional(number())))

export const createEquipoSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  apellido: pipe(string(), minLength(1, 'El apellido es requerido'), maxLength(255)),
  dni: optionalField(pipe(string(), minLength(6, 'DNI debe tener al menos 6 caracteres'), maxLength(20))),
  telefono: optionalField(pipe(string(), minLength(1), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'), transform((v) => v.trim().toLowerCase()))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  barrioId: optionalNum,
  direccion: optionalField(pipe(string(), maxLength(255))),
  tipo: pipe(string(), check((v) => ['EQUIPO', 'ESTRATEGIA', 'FISCAL', 'VECINO'].includes(v), 'Tipo de miembro inválido')),
  observaciones: optionalField(pipe(string())),
  contrasena: optionalField(pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres'))),
  nombreUsuario: optionalField(usernameSchema),
})

export const updateEquipoSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  apellido: optionalField(pipe(string(), minLength(1), maxLength(255))),
  dni: optionalField(pipe(string(), minLength(6), maxLength(20))),
  telefono: optionalField(pipe(string(), minLength(1), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'), transform((v) => v.trim().toLowerCase()))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  barrioId: optionalNum,
  direccion: optionalField(pipe(string(), maxLength(255))),
  tipo: optionalField(pipe(string(), check((v) => ['EQUIPO', 'ESTRATEGIA', 'FISCAL', 'VECINO'].includes(v), 'Tipo inválido'))),
  activo: optionalBool,
  observaciones: optionalField(pipe(string())),
  contrasena: optionalField(pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres'))),
  nombreUsuario: optionalField(usernameSchema),
})

// ── 1. EMPRESAS ──
export const createEmpresaSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  direccion: pipe(string(), minLength(1, 'La dirección es requerida'), maxLength(255)),
  barrioId: pipe(unknown(), transform(toOptNumber), pipe(number('El barrio es requerido'), integer(), minValue(1))),
  rubro: optionalField(pipe(string(), maxLength(100))),
  tamano: optionalField(pipe(string(), check((v) => ['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE'].includes(v), 'Tamaño inválido'))),
  cuit: optionalField(pipe(string(), maxLength(30))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  contactoPrincipal: optionalField(pipe(string(), maxLength(150))),
  observaciones: optionalField(pipe(string())),
})

export const updateEmpresaSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  direccion: optionalField(pipe(string(), minLength(1), maxLength(255))),
  barrioId: optionalNum,
  rubro: optionalField(pipe(string(), maxLength(100))),
  tamano: optionalField(pipe(string(), check((v) => ['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE'].includes(v), 'Tamaño inválido'))),
  cuit: optionalField(pipe(string(), maxLength(30))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  contactoPrincipal: optionalField(pipe(string(), maxLength(150))),
  observaciones: optionalField(pipe(string())),
  activa: optionalBool,
})

// ── 2. STAKEHOLDERS ──
export const createStakeholderSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  apellido: pipe(string(), minLength(1, 'El apellido es requerido'), maxLength(255)),
  esAliado: optionalBool,
  fechaUltimoContacto: optionalField(pipe(string(), minLength(1))),
  cargo: optionalField(pipe(string(), maxLength(150))),
  organizacion: optionalField(pipe(string(), maxLength(150))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  barrioId: optionalNum,
  nivelInfluencia: optionalField(pipe(unknown(), transform(toOptNumber), optional(pipe(number(), integer(), minValue(1), maxValue(10))))),
  observaciones: optionalField(pipe(string())),
})

export const updateStakeholderSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  apellido: optionalField(pipe(string(), minLength(1), maxLength(255))),
  esAliado: optionalBool,
  fechaUltimoContacto: optionalField(pipe(string(), minLength(1))),
  cargo: optionalField(pipe(string(), maxLength(150))),
  organizacion: optionalField(pipe(string(), maxLength(150))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  barrioId: optionalNum,
  nivelInfluencia: optionalField(pipe(unknown(), transform(toOptNumber), optional(pipe(number(), integer(), minValue(1), maxValue(10))))),
  observaciones: optionalField(pipe(string())),
  activo: optionalBool,
})

// ── 3. ESCUELAS ──
export const createEscuelaSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  nivel: pipe(string(), check((v) => ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'TERCIARIA', 'UNIVERSITARIA', 'ESPECIAL'].includes(v), 'Nivel educativo inválido')),
  numero: optionalNum,
  modalidad: optionalField(pipe(string(), maxLength(100))),
  direccion: optionalField(pipe(string(), maxLength(255))),
  barrioId: optionalNum,
  director: optionalField(pipe(string(), maxLength(150))),
  telefonoDirector: optionalField(pipe(string(), maxLength(50))),
  emailDirector: optionalField(pipe(string(), email('Email inválido'))),
  observaciones: optionalField(pipe(string())),
})

export const updateEscuelaSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  nivel: optionalField(pipe(string(), check((v) => ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'TERCIARIA', 'UNIVERSITARIA', 'ESPECIAL'].includes(v), 'Nivel educativo inválido'))),
  numero: optionalNum,
  modalidad: optionalField(pipe(string(), maxLength(100))),
  direccion: optionalField(pipe(string(), maxLength(255))),
  barrioId: optionalNum,
  director: optionalField(pipe(string(), maxLength(150))),
  telefonoDirector: optionalField(pipe(string(), maxLength(50))),
  emailDirector: optionalField(pipe(string(), email('Email inválido'))),
  observaciones: optionalField(pipe(string())),
  activa: optionalBool,
})

// ── 4. RECLAMOS ──
export const createReclamoSchema = object({
  vecino: pipe(string(), minLength(1, 'El nombre del vecino es requerido'), maxLength(255)),
  titulo: pipe(string(), minLength(1, 'El título es requerido'), maxLength(255)),
  descripcion: pipe(string(), minLength(1, 'La descripción es requerida')),
  dni: optionalField(pipe(string(), maxLength(20))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  barrioId: optionalNum,
  direccion: optionalField(pipe(string(), maxLength(255))),
  categoria: optionalField(pipe(string(), check((v) => ['ALUMBRADO', 'PAVIMENTO', 'AGUA', 'CLOACAS', 'LIMPIEZA', 'SEGURIDAD', 'TRANSPORTE', 'SALUD', 'OTRO'].includes(v), 'Categoría inválida'))),
  estado: optionalField(pipe(string(), check((v) => ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'].includes(v), 'Estado inválido'))),
  prioridad: optionalField(pipe(string(), check((v) => ['ALTA', 'MEDIA', 'BAJA'].includes(v), 'Prioridad inválida'))),
  respuesta: optionalField(pipe(string())),
  asignadoAId: optionalNum,
  observaciones: optionalField(pipe(string())),
})

export const updateReclamoSchema = object({
  vecino: optionalField(pipe(string(), minLength(1), maxLength(255))),
  titulo: optionalField(pipe(string(), minLength(1), maxLength(255))),
  descripcion: optionalField(pipe(string(), minLength(1))),
  dni: optionalField(pipe(string(), maxLength(20))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  barrioId: optionalNum,
  direccion: optionalField(pipe(string(), maxLength(255))),
  categoria: optionalField(pipe(string(), check((v) => ['ALUMBRADO', 'PAVIMENTO', 'AGUA', 'CLOACAS', 'LIMPIEZA', 'SEGURIDAD', 'TRANSPORTE', 'SALUD', 'OTRO'].includes(v), 'Categoría inválida'))),
  estado: optionalField(pipe(string(), check((v) => ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'].includes(v), 'Estado inválido'))),
  prioridad: optionalField(pipe(string(), check((v) => ['ALTA', 'MEDIA', 'BAJA'].includes(v), 'Prioridad inválida'))),
  respuesta: optionalField(pipe(string())),
  asignadoAId: optionalNum,
  observaciones: optionalField(pipe(string())),
})

// ── 5. OPOSICION (PARTIDOS + CANDIDATOS) ──
export const createPartidoSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre del partido es requerido'), maxLength(255)),
  sigla: optionalField(pipe(string(), maxLength(20))),
  color: optionalField(pipe(string(), maxLength(20))),
  referenteNombre: optionalField(pipe(string(), maxLength(150))),
  observaciones: optionalField(pipe(string())),
})

export const updatePartidoSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  sigla: optionalField(pipe(string(), maxLength(20))),
  color: optionalField(pipe(string(), maxLength(20))),
  referenteNombre: optionalField(pipe(string(), maxLength(150))),
  observaciones: optionalField(pipe(string())),
  activo: optionalBool,
})

export const createCandidatoSchema = object({
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  apellido: pipe(string(), minLength(1, 'El apellido es requerido'), maxLength(255)),
  partidoId: optionalNum,
  cargo: optionalField(pipe(string(), maxLength(150))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  fortalezas: optionalField(pipe(string())),
  debilidades: optionalField(pipe(string())),
  infoEstrategica: optionalField(pipe(string())),
  nivelAmenaza: optionalField(pipe(string(), check((v) => ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'].includes(v), 'Nivel de amenaza inválido'))),
  observaciones: optionalField(pipe(string())),
})

export const updateCandidatoSchema = object({
  nombre: optionalField(pipe(string(), minLength(1), maxLength(255))),
  apellido: optionalField(pipe(string(), minLength(1), maxLength(255))),
  partidoId: optionalNum,
  cargo: optionalField(pipe(string(), maxLength(150))),
  telefono: optionalField(pipe(string(), maxLength(50))),
  email: optionalField(pipe(string(), email('Email inválido'))),
  instagram: optionalField(pipe(string(), maxLength(100))),
  fortalezas: optionalField(pipe(string())),
  debilidades: optionalField(pipe(string())),
  infoEstrategica: optionalField(pipe(string())),
  nivelAmenaza: optionalField(pipe(string(), check((v) => ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'].includes(v), 'Nivel de amenaza inválido'))),
  observaciones: optionalField(pipe(string())),
  activo: optionalBool,
})

// ── 6. TAREAS Y COMENTARIOS ──
export const createTareaSchema = object({
  titulo: pipe(string(), minLength(1, 'El título es requerido'), maxLength(255)),
  descripcion: optionalField(pipe(string())),
  estado: optionalField(pipe(string(), check((v) => ['PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA', 'CANCELADA'].includes(v), 'Estado inválido'))),
  prioridad: optionalField(pipe(string(), check((v) => ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'].includes(v), 'Prioridad inválida'))),
  asignadosIds: optionalNumArray,
  fechaLimite: optionalField(pipe(string(), minLength(1))),
  barrioId: optionalNum,
  etiquetas: tagsField,
  observaciones: optionalField(pipe(string())),
})

export const updateTareaSchema = object({
  titulo: optionalField(pipe(string(), minLength(1), maxLength(255))),
  descripcion: optionalField(pipe(string())),
  estado: optionalField(pipe(string(), check((v) => ['PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA', 'CANCELADA'].includes(v), 'Estado inválido'))),
  prioridad: optionalField(pipe(string(), check((v) => ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'].includes(v), 'Prioridad inválida'))),
  asignadosIds: optionalNumArray,
  fechaLimite: optionalField(pipe(string())),
  barrioId: optionalNum,
  etiquetas: tagsField,
  observaciones: optionalField(pipe(string())),
})

export const createComentarioSchema = object({
  autor: pipe(string(), minLength(1, 'El autor es requerido'), maxLength(150)),
  mensaje: pipe(string(), minLength(1, 'El mensaje es requerido')),
  usuarioId: optionalNum,
})

