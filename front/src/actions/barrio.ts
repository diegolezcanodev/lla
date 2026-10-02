'use server'

import { revalidatePath } from 'next/cache'
import { apiClient } from '../lib/apiClient'
import { actionError } from '../lib/actionResult'
import type { ActionResult } from '../lib/actionResult'
import type { BarrioResponseDTO, CreateBarrioDTO, UpdateBarrioDTO } from '../types/barrio'

export async function createBarrio(dto: CreateBarrioDTO): Promise<ActionResult<BarrioResponseDTO>> {
  try {
    const data = await apiClient<BarrioResponseDTO>('/api/barrios', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    revalidatePath('/barrios')
    revalidatePath('/equipo')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateBarrio(
  id: number,
  dto: UpdateBarrioDTO,
): Promise<ActionResult<BarrioResponseDTO>> {
  try {
    const data = await apiClient<BarrioResponseDTO>(`/api/barrios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
    revalidatePath('/barrios')
    revalidatePath('/equipo')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteBarrio(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/barrios/${id}`, { method: 'DELETE' })
    revalidatePath('/barrios')
    revalidatePath('/equipo')
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
