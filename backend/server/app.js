import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import config from './config/index.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: config.bodyLimit }))

const limiterLogin = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
})
app.use('/api/admin/login', limiterLogin)
app.use('/api/auth/empresa/login', limiterLogin)

app.use('/api', routes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use(errorHandler)

export default app
