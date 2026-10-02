import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: { nombre: 'Administrador' },
  })

  await prisma.rol.upsert({
    where: { nombre: 'Usuario' },
    update: {},
    create: { nombre: 'Usuario' },
  })

  await prisma.rol.upsert({
    where: { nombre: 'Equipo' },
    update: {},
    create: { nombre: 'Equipo' },
  })

  await prisma.rol.upsert({
    where: { nombre: 'Estrategia' },
    update: {},
    create: { nombre: 'Estrategia' },
  })

  const hashed = await bcrypt.hash('admin123', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@lla.com' },
    update: { contrasena: hashed, activo: true, nombreUsuario: 'admin' },
    create: {
      email: 'admin@lla.com',
      nombreUsuario: 'admin',
      contrasena: hashed,
      nombre: 'Admin',
      apellido: 'LLA',
      activo: true,
      usuarioRoles: { create: [{ rolId: adminRol.id }] },
    },
    include: { usuarioRoles: { include: { rol: true } } },
  })

  console.log(`[seed] Admin listo: ${admin.email} (usuario: ${admin.nombreUsuario}) / admin123`)
  console.log(`[seed] Roles: ${admin.usuarioRoles.map((ur) => ur.rol.nombre).join(', ')}`)
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
