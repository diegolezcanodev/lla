import { getUsuarios } from '../../../services/usuarios'
import { KpiCard } from '../../../components/KpiCard'
import { Users, ShieldCheck, Zap, ArrowRight, Layers, Database } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const usuariosRes = await getUsuarios(1, 1).catch(() => null)
  const totalUsuarios = usuariosRes ? usuariosRes.total : 1

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Banner de bienvenida */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#8B5CF6] p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema en Línea · v1.0.0
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Panel de Control LLA
          </h1>
          <p className="text-violet-100 text-sm md:text-base leading-relaxed">
            Arquitectura base lista y operativa con tema violeta unificado, autenticación protegida y componentes base preparados para los próximos ABMs.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/4 h-48 w-48 rounded-full bg-purple-400/20 blur-xl" />
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          label="Usuarios del Sistema"
          value={totalUsuarios}
          tone="accent"
          sub="Cuentas registradas y activas"
        />
        <KpiCard
          label="Servidor Backend"
          value="Activo"
          tone="info"
          sub="Express + Prisma + PostgreSQL"
        />
        <KpiCard
          label="Diseño y Estética"
          value="Violeta"
          tone="secondary"
          sub="Tailwind CSS + Tokens"
        />
      </div>

      {/* Grid de módulos y accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor principal de estado */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-primary">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-text-primary text-base">
                    Módulos y Entidades de Dominio
                  </h2>
                  <p className="text-xs text-text-secondary">Estructura preparada para ABMs</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-primary border border-violet-200">
                Fase 1 Completada
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                  <ShieldCheck size={18} />
                  <span>Autenticación y Roles</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Sesión con cookies firmadas, middleware de protección de rutas, roles Administrador y Usuario.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-border bg-bg-secondary/40 p-4">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-sm mb-1">
                  <Database size={18} />
                  <span>Base de Datos Dual</span>
                </div>
                <p className="text-xs text-text-secondary">
                  PostgreSQL principal + base de datos asíncrona de auditoría y logs HTTP / queries.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-bg-secondary/50 border border-border">
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary">Próximo paso:</strong> Definir las entidades del nuevo dominio para generar los modelos Prisma, servicios de aplicación, controladores y pantallas CRUD usando el hook <code className="text-primary font-semibold bg-violet-100/60 px-1 py-0.5 rounded">useCrud</code> y componentes base.
              </p>
            </div>
          </div>
        </div>

        {/* Panel lateral de accesos rápidos */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-primary">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-text-primary text-base">
                  Accesos Rápidos
                </h2>
                <p className="text-xs text-text-secondary">Atajos de administración</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                href="/usuarios"
                className="group flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary hover:bg-violet-50/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bg-secondary group-hover:bg-violet-100 group-hover:text-primary transition-colors text-text-secondary">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Gestión de Usuarios</p>
                    <p className="text-xs text-text-tertiary">Listar y crear usuarios</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-tertiary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
            <span>Ambiente: {process.env.NODE_ENV ?? 'development'}</span>
            <span className="font-medium text-primary">LLA Core v0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
