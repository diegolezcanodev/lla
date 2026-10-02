-- CreateEnum
CREATE TYPE "TamanoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE');

-- CreateEnum
CREATE TYPE "NivelEducativo" AS ENUM ('INICIAL', 'PRIMARIA', 'SECUNDARIA', 'TERCIARIA', 'UNIVERSITARIA', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "CategoriaReclamo" AS ENUM ('ALUMBRADO', 'PAVIMENTO', 'AGUA', 'CLOACAS', 'LIMPIEZA', 'SEGURIDAD', 'TRANSPORTE', 'SALUD', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoReclamo" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "PrioridadReclamo" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "NivelAmenaza" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PrioridadTarea" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rubro" TEXT,
    "tamano" "TamanoEmpresa",
    "cuit" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT NOT NULL,
    "barrioId" INTEGER NOT NULL,
    "contactoPrincipal" TEXT,
    "observaciones" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "esAliado" BOOLEAN NOT NULL DEFAULT false,
    "fechaUltimoContacto" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cargo" TEXT,
    "organizacion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "barrioId" INTEGER,
    "nivelInfluencia" INTEGER NOT NULL DEFAULT 5,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escuela" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER,
    "nivel" "NivelEducativo" NOT NULL,
    "modalidad" TEXT,
    "direccion" TEXT,
    "barrioId" INTEGER,
    "director" TEXT,
    "telefonoDirector" TEXT,
    "emailDirector" TEXT,
    "matricula" INTEGER,
    "observaciones" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reclamo" (
    "id" SERIAL NOT NULL,
    "vecino" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "barrioId" INTEGER,
    "direccion" TEXT,
    "categoria" "CategoriaReclamo" NOT NULL DEFAULT 'OTRO',
    "estado" "EstadoReclamo" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "PrioridadReclamo" NOT NULL DEFAULT 'MEDIA',
    "descripcion" TEXT NOT NULL,
    "respuesta" TEXT,
    "asignadoAId" INTEGER,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reclamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "sigla" TEXT,
    "color" VARCHAR(20),
    "referenteNombre" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "partidoId" INTEGER,
    "cargo" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "fortalezas" TEXT,
    "debilidades" TEXT,
    "infoEstrategica" TEXT,
    "nivelAmenaza" "NivelAmenaza" NOT NULL DEFAULT 'BAJO',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'MEDIA',
    "asignadoAId" INTEGER,
    "fechaLimite" DATE,
    "barrioId" INTEGER,
    "etiquetas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioTarea" (
    "id" SERIAL NOT NULL,
    "tareaId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "autor" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioTarea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cuit_key" ON "Empresa"("cuit");

-- CreateIndex
CREATE INDEX "Empresa_barrioId_idx" ON "Empresa"("barrioId");

-- CreateIndex
CREATE INDEX "Empresa_activa_idx" ON "Empresa"("activa");

-- CreateIndex
CREATE INDEX "Stakeholder_barrioId_idx" ON "Stakeholder"("barrioId");

-- CreateIndex
CREATE INDEX "Stakeholder_esAliado_idx" ON "Stakeholder"("esAliado");

-- CreateIndex
CREATE INDEX "Stakeholder_activo_idx" ON "Stakeholder"("activo");

-- CreateIndex
CREATE INDEX "Escuela_barrioId_idx" ON "Escuela"("barrioId");

-- CreateIndex
CREATE INDEX "Escuela_nivel_idx" ON "Escuela"("nivel");

-- CreateIndex
CREATE INDEX "Escuela_activa_idx" ON "Escuela"("activa");

-- CreateIndex
CREATE INDEX "Reclamo_barrioId_idx" ON "Reclamo"("barrioId");

-- CreateIndex
CREATE INDEX "Reclamo_estado_idx" ON "Reclamo"("estado");

-- CreateIndex
CREATE INDEX "Reclamo_categoria_idx" ON "Reclamo"("categoria");

-- CreateIndex
CREATE INDEX "Reclamo_prioridad_idx" ON "Reclamo"("prioridad");

-- CreateIndex
CREATE INDEX "Reclamo_asignadoAId_idx" ON "Reclamo"("asignadoAId");

-- CreateIndex
CREATE UNIQUE INDEX "Partido_nombre_key" ON "Partido"("nombre");

-- CreateIndex
CREATE INDEX "Partido_activo_idx" ON "Partido"("activo");

-- CreateIndex
CREATE INDEX "Candidato_partidoId_idx" ON "Candidato"("partidoId");

-- CreateIndex
CREATE INDEX "Candidato_nivelAmenaza_idx" ON "Candidato"("nivelAmenaza");

-- CreateIndex
CREATE INDEX "Candidato_activo_idx" ON "Candidato"("activo");

-- CreateIndex
CREATE INDEX "Tarea_estado_idx" ON "Tarea"("estado");

-- CreateIndex
CREATE INDEX "Tarea_prioridad_idx" ON "Tarea"("prioridad");

-- CreateIndex
CREATE INDEX "Tarea_asignadoAId_idx" ON "Tarea"("asignadoAId");

-- CreateIndex
CREATE INDEX "Tarea_barrioId_idx" ON "Tarea"("barrioId");

-- CreateIndex
CREATE INDEX "Tarea_fechaLimite_idx" ON "Tarea"("fechaLimite");

-- CreateIndex
CREATE INDEX "ComentarioTarea_tareaId_idx" ON "ComentarioTarea"("tareaId");

-- CreateIndex
CREATE INDEX "ComentarioTarea_usuarioId_idx" ON "ComentarioTarea"("usuarioId");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escuela" ADD CONSTRAINT "Escuela_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamo" ADD CONSTRAINT "Reclamo_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamo" ADD CONSTRAINT "Reclamo_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "MiembroEquipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidato" ADD CONSTRAINT "Candidato_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "MiembroEquipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioTarea" ADD CONSTRAINT "ComentarioTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioTarea" ADD CONSTRAINT "ComentarioTarea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
