import crypto from 'crypto'

function requerirJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const ejemplo = crypto.randomBytes(32).toString('hex')
    console.error('❌ JWT_SECRET es obligatorio. Configúralo en el archivo .env:')
    console.error(`   JWT_SECRET="${ejemplo}"`)
    process.exit(1)
  }
  return process.env.JWT_SECRET
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: requerirJwtSecret(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 25,
    maxGlobal: 200,
  },
  bodyLimit: '1mb',
  jwtExpiresIn: '4h',
}

export default config
