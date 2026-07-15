import crypto from 'crypto'

function generarJwtSecret() {
  const secret = crypto.randomBytes(32).toString('hex')
  console.log('⚠️  JWT_SECRET no definido. Se generó un secret automático.')
  console.log(`   Para fijarlo: export JWT_SECRET="${secret}"`)
  return secret
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || generarJwtSecret(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 10,
  },
  bodyLimit: '1mb',
  jwtExpiresIn: '4h',
}

export default config
