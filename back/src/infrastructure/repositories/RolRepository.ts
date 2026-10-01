import { PrismaClient } from '@prisma/client'
import { RolEntity } from '../../modules/roles/domain/RolEntity'
import { IRolRepository } from '../../modules/roles/domain/IRolRepository'

export class RolRepository implements IRolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<RolEntity[]> {
    const records = await this.prisma.rol.findMany({ orderBy: { id: 'asc' } })
    return records.map((r) => new RolEntity({ nombre: r.nombre }, r.id))
  }
}
