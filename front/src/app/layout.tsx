import type { ReactNode } from 'react'
import { Sora } from 'next/font/google'
import { Toaster } from 'sonner'
import '../styles/globals.css'
import '../styles/animations.css'

const sora = Sora({ subsets: ['latin'], variable: '--font-display' })

export const metadata = {
  title: 'LLA',
  description: 'Sistema de gestión LLA',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={sora.variable}>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
