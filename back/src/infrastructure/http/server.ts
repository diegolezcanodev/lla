import { createApp } from './app'
import { config } from '../../config'
import { closeLogger } from '../logger/logger'
import { execSync } from 'child_process'

function killPortIfOccupied(port: number): void {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
      const lines = output.trim().split('\n')
      const pidsToKill = new Set<string>()

      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`) && parts[3] === 'LISTENING') {
          const pid = parts[4]
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            pidsToKill.add(pid)
          }
        }
      }

      for (const pid of pidsToKill) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
          console.log(`[Server] Puerto ${port} liberado (cerrado proceso huérfano PID ${pid})`)
        } catch {}
      }
    } else {
      execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' })
    }
  } catch {}
}

async function startServer(): Promise<void> {
  const app = createApp()

  const server = app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`)
  })

  server.on('error', async (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Puerto ${config.port} ocupado. Liberando automáticamente...`)
      killPortIfOccupied(config.port)
      setTimeout(() => {
        server.close()
        startServer()
      }, 1000)
    } else {
      console.error('[Fatal] Server error:', err)
      process.exit(1)
    }
  })

  const shutdown = async () => {
    console.log('[Server] Shutting down...')
    server.close()
    await closeLogger()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer().catch((err) => {
  console.error('[Fatal] Failed to start server', err)
  process.exit(1)
})
