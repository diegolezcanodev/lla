'use server'

import { revalidatePath } from 'next/cache'
import { apiClient } from '../lib/apiClient'
import { actionError } from '../lib/actionResult'
import type { ActionResult } from '../lib/actionResult'
import type { UserResponseDTO, CreateUserDTO, UpdateUserDTO } from '../types/user'

export async function createUsuario(dto: CreateUserDTO): Promise<ActionResult<UserResponseDTO>> {
  try {
    const data = await apiClient<UserResponseDTO>('/api/users', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    revalidatePath('/usuarios')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateUsuario(id: number, dto: UpdateUserDTO): Promise<ActionResult<UserResponseDTO>> {
  try {
    const data = await apiClient<UserResponseDTO>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
    revalidatePath('/usuarios')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteUsuario(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/users/${id}`, { method: 'DELETE' })
    revalidatePath('/usuarios')
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
