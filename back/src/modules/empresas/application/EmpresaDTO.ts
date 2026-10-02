import { TamanoEmpresa } from "../domain/EmpresaEntity"

export interface CreateEmpresaDTO {
  nombre: string
  direccion: string
  barrioId: number
  rubro?: string | null
  tamano?: TamanoEmpresa | null
  cuit?: string | null
  telefono?: string | null
  email?: string | null
  contactoPrincipal?: string | null
  observaciones?: string | null
}

export interface UpdateEmpresaDTO {
  nombre?: string
  direccion?: string
  barrioId?: number
  rubro?: string | null
  tamano?: TamanoEmpresa | null
  cuit?: string | null
  telefono?: string | null
  email?: string | null
  contactoPrincipal?: string | null
  observaciones?: string | null
  activa?: boolean
}

export interface EmpresaResponseDTO {
  id: number
  nombre: string
  direccion: string
  barrioId: number
  barrioNombre: string | null
  rubro: string | null
  tamano: TamanoEmpresa | null
  cuit: string | null
  telefono: string | null
  email: string | null
  contactoPrincipal: string | null
  observaciones: string | null
  activa: boolean
  creadoEn: string
  actualizadoEn: string
}
