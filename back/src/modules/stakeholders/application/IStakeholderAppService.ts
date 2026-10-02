import { CreateStakeholderDTO, UpdateStakeholderDTO, StakeholderResponseDTO } from "./StakeholderDTO"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindStakeholdersParams } from "../domain/IStakeholderRepository"

export interface IStakeholderAppService {
  create(dto: CreateStakeholderDTO): Promise<StakeholderResponseDTO>
  update(id: number, dto: UpdateStakeholderDTO): Promise<StakeholderResponseDTO>
  registrarContacto(id: number, fecha?: string): Promise<StakeholderResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<StakeholderResponseDTO>
  list(params: FindStakeholdersParams): Promise<PaginatedResult<StakeholderResponseDTO>>
}
