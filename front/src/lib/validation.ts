import {
  pipe,
  string,
  minLength,
  maxLength,
  check,
  transform,
} from 'valibot'

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
