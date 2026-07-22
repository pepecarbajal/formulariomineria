import 'dotenv/config'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'

const credentials = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
}

if (!getApps().length) initializeApp({ credential: cert(credentials) })
const db = getFirestore()

const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD

if (!EMAIL) {
  console.error('ADMIN_EMAIL no definido. Uso: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secreto node seed-admin.js')
  process.exit(1)
}

if (!PASSWORD || PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD debe tener al menos 8 caracteres.')
  process.exit(1)
}

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10)
  await db.collection('admin').doc(EMAIL).set({
    email: EMAIL,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  })
  console.log(`Admin creado: ${EMAIL}`)
}

main().catch(console.error)
