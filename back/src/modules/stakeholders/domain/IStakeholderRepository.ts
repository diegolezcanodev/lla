import { StakeholderEntity } from "./StakeholderEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindStakeholdersParams extends PaginationInput {
  search?: string
  barrioId?: number
  esAliado?: boolean
  activo?: boolean
}

export interface IStakeholderRepository {
  findById(id: number): Promise<StakeholderEntity | null>
  findAll(params: FindStakeholdersParams): Promise<PaginatedResult<StakeholderEntity>>
  save(entity: StakeholderEntity): Promise<StakeholderEntity>
  delete(id: number): Promise<void>
}
