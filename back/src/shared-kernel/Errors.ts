export class NotFoundError extends Error {
  constructor(entity: string, id: string | number) {
    super(`${entity} con id ${id} no encontrado`)
    this.name = 'NotFoundError'
  }
}

export class AlreadyExistsError extends Error {
  field?: string

  constructor(entity: string, identifier: string, field?: string) {
    super(`${entity} "${identifier}" ya existe`)
    this.name = 'AlreadyExistsError'
    this.field = field
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Credenciales inválidas') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'ConflictError'
    this.code = code
    this.details = details
  }
}

export class ValidationError extends Error {
  details?: any

  constructor(message: string, details?: any) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class StorageFileNotFoundError extends Error {
  code = 'FILE_NOT_FOUND_IN_STORAGE'

  constructor(storagePath: string) {
    super(`El archivo no se encuentra disponible en el almacenamiento (${storagePath})`)
    this.name = 'StorageFileNotFoundError'
  }
}
