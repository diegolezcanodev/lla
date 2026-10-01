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
  optional,
  nullable,
  boolean,
  transform,
  unknown,
} from 'valibot'

export const clean = (v: unknown) => (v === '' || v === undefined || v === null ? undefined : v)

export const optionalField = (schema: any) =>
  optional(pipe(unknown(), transform(clean), optional(schema)))

export const optStr = (schema: any) => optionalField(schema)

export const nullableOptStr = (schema: any) =>
  optional(
    nullable(
      pipe(
        unknown(),
        transform((v: unknown) => {
          if (v === null || (typeof v === 'string' && v.trim() === '')) return null
          if (v === undefined) return undefined
          return v
        }),
        nullable(schema),
      ),
    ),
  )

export const toBoolean = (v: unknown): boolean | undefined => {
  if (v === '' || v === undefined || v === null) return undefined
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return undefined
}

export const optionalBool = optional(pipe(unknown(), transform(toBoolean), optional(boolean())))

export const loginSchema = pipe(
  object({
    login: optionalField(pipe(string(), minLength(1, 'Usuario o email requerido'))),
    email: optionalField(pipe(string(), minLength(1, 'Usuario o email requerido'))),
    password: pipe(string(), minLength(1, 'Contraseña requerida')),
  }),
  check((data) => !!(data.login || data.email), 'Debe ingresar su usuario o email'),
)

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
  rolIds: pipe(array(pipe(number(), integer(), minValue(1))), minLength(1, 'Al menos un rol es requerido')),
})

export const updateUserSchema = object({
  email: optStr(pipe(string(), email('Email inválido'), transform((v) => v.trim().toLowerCase()))),
  nombreUsuario: optional(
    pipe(
      unknown(),
      check((v) => v !== '' && v !== null, 'El nombre de usuario no puede estar vacío'),
      usernameSchema,
    ),
  ),
  contrasena: optStr(pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres'))),
  nombre: optStr(pipe(string(), minLength(1), maxLength(255))),
  apellido: optStr(pipe(string(), minLength(1), maxLength(255))),
  rolIds: optionalField(pipe(array(pipe(number(), integer(), minValue(1))), minLength(1, 'Al menos un rol es requerido'))),
  activo: optionalBool,
})
