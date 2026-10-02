-- DropIndex
DROP INDEX IF EXISTS "MiembroEquipo_barrio_idx";

-- AlterTable
ALTER TABLE "MiembroEquipo" DROP COLUMN IF EXISTS "barrio",
DROP COLUMN IF EXISTS "circuito",
DROP COLUMN IF EXISTS "localidad",
ADD COLUMN IF NOT EXISTS "barrioId" INTEGER,
ADD COLUMN IF NOT EXISTS "instagram" TEXT,
ALTER COLUMN "telefono" DROP NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Barrio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barrio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Barrio_nombre_key" ON "Barrio"("nombre");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Barrio_activo_idx" ON "Barrio"("activo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MiembroEquipo_barrioId_idx" ON "MiembroEquipo"("barrioId");

-- AddForeignKey
ALTER TABLE "MiembroEquipo" ADD CONSTRAINT "MiembroEquipo_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
