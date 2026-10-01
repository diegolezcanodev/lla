'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, User, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../../services/auth'
import { ApiError } from '../../lib/apiClient'
import { AsyncButton } from '../../components/AsyncButton'
import { VERSION } from '../../lib/version'

export function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      await login(identifier, password)
      setIsExiting(true)
      await new Promise((r) => setTimeout(r, 250))
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Error de conexión con el servidor')
      }
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 animate-page-enter bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#5B21B6]"
    >
      {/* Círculos decorativos ambientales en tonos violeta */}
      <div
        className={`pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-3xl transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-40 -right-36 h-[32rem] w-[32rem] rounded-full bg-purple-600/25 blur-3xl transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-16 left-[10%] h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-80'
        }`}
      />

      {/* Contenedor central: logo LLA + card */}
      <div
        className={`relative z-10 flex w-full max-w-md flex-col items-center transition-all duration-300 ease-out ${
          isExiting ? 'scale-95 opacity-0 blur-sm' : 'scale-100 opacity-100'
        }`}
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
            <Sparkles className="h-10 w-10 text-violet-200" />
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-extrabold tracking-[0.25em] text-white drop-shadow-md">
              LLA
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-violet-200/90 font-medium">
              Sistema de Gestión
            </p>
          </div>
        </div>

        {/* Card blanca redondeada con detalle violeta */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-white px-8 py-10 shadow-[0_25px_60px_rgba(0,0,0,0.3)] sm:px-10 border border-violet-100">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/10" />

          <div className="relative text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              ¡Bienvenido!
            </h1>
            <p className="mt-2 text-sm text-text-tertiary">
              Ingresá tus credenciales para acceder al panel.
            </p>
          </div>

          <form className="relative mt-8 space-y-5" onSubmit={handleSubmit}>
            <Field
              id="identifier"
              label="Usuario o Email"
              type="text"
              placeholder="admin o admin@lla.com"
              icon={<User size={18} />}
              value={identifier}
              onChange={setIdentifier}
              autoComplete="username"
            />

            <Field
              id="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={<LockKeyhole size={18} />}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <AsyncButton
              type="submit"
              loading={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-700/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-lg hover:shadow-violet-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>Ingresar</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </AsyncButton>
          </form>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-xs text-white/50">
        Versión {VERSION}
      </p>
    </div>
  )
}

function Field({
  id,
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  return (
    <label htmlFor={id} className="group block space-y-1.5">
      <span className="text-xs font-semibold text-text-secondary">
        {label}
      </span>
      <span className="flex items-center gap-3 rounded-2xl border border-border/80 bg-bg-secondary/40 px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 hover:border-violet-300">
        <span className="text-text-tertiary transition-colors group-focus-within:text-primary">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="w-full border-0 bg-transparent p-0 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0"
        />
      </span>
    </label>
  )
}
