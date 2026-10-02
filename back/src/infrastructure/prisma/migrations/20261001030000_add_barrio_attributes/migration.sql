-- CreateEnum
CREATE TYPE "PrioridadBarrio" AS ENUM ('ALTA', 'MEDIA', 'BAJA', 'EN_DISPUTA');

-- AlterTable
ALTER TABLE "Barrio" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(10),
ADD COLUMN IF NOT EXISTS "color" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "descripcion" TEXT,
ADD COLUMN IF NOT EXISTS "observaciones" TEXT,
ADD COLUMN IF NOT EXISTS "prioridad" "PrioridadBarrio" NOT NULL DEFAULT 'MEDIA',
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Barrio_prioridad_idx" ON "Barrio"("prioridad");
