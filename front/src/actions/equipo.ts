'use server'

import { revalidatePath } from 'next/cache'
import { apiClient } from '../lib/apiClient'
import { actionError } from '../lib/actionResult'
import type { ActionResult } from '../lib/actionResult'
import type {
  MiembroEquipoResponseDTO,
  CreateMiembroEquipoDTO,
  UpdateMiembroEquipoDTO,
} from '../types/equipo'

export async function createMiembroEquipo(
  dto: CreateMiembroEquipoDTO,
): Promise<ActionResult<MiembroEquipoResponseDTO>> {
  try {
    const data = await apiClient<MiembroEquipoResponseDTO>('/api/equipo', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    revalidatePath('/equipo')
    revalidatePath('/usuarios')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateMiembroEquipo(
  id: number,
  dto: UpdateMiembroEquipoDTO,
): Promise<ActionResult<MiembroEquipoResponseDTO>> {
  try {
    const data = await apiClient<MiembroEquipoResponseDTO>(`/api/equipo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
    revalidatePath('/equipo')
    revalidatePath('/usuarios')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteMiembroEquipo(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/equipo/${id}`, { method: 'DELETE' })
    revalidatePath('/equipo')
    revalidatePath('/usuarios')
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
