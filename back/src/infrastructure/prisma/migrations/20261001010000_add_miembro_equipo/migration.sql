-- CreateEnum
CREATE TYPE "TipoMiembro" AS ENUM ('EQUIPO', 'ESTRATEGIA', 'FISCAL', 'VECINO');

-- CreateTable
CREATE TABLE "MiembroEquipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "barrio" TEXT NOT NULL,
    "localidad" TEXT,
    "direccion" TEXT,
    "circuito" TEXT,
    "tipo" "TipoMiembro" NOT NULL DEFAULT 'EQUIPO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "usuarioId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiembroEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MiembroEquipo_dni_key" ON "MiembroEquipo"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "MiembroEquipo_usuarioId_key" ON "MiembroEquipo"("usuarioId");

-- CreateIndex
CREATE INDEX "MiembroEquipo_tipo_idx" ON "MiembroEquipo"("tipo");

-- CreateIndex
CREATE INDEX "MiembroEquipo_barrio_idx" ON "MiembroEquipo"("barrio");

-- CreateIndex
CREATE INDEX "MiembroEquipo_activo_idx" ON "MiembroEquipo"("activo");

-- AddForeignKey
ALTER TABLE "MiembroEquipo" ADD CONSTRAINT "MiembroEquipo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
