import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import { createRoutes } from './routes'
import { errorHandler } from '../middleware/errorHandler'
import { authMiddleware } from '../middleware/authMiddleware'
import { requestLogger } from '../middleware/requestLogger'
import { createGlobalRateLimiter } from '../middleware/rateLimiter'
import { Container } from '../di/container'
import { config } from '../../config'

export function createApp(): express.Application {
  const app = express()
  const container = new Container()

  app.set('trust proxy', config.rateLimit.trustProxy)
  app.use(helmet())
  app.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (config.cors.origins.length === 0) {
          return callback(null, config.nodeEnv !== 'production')
        }
        callback(null, config.cors.origins.includes(origin))
      },
    }),
  )
  app.use(createGlobalRateLimiter())
  app.use(express.json())
  app.use(cookieParser(config.cookie.secret))
  app.use(authMiddleware)
  app.use(requestLogger)
  app.use(createRoutes(container))
  app.use(errorHandler)

  return app
}
