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

const USERS = [
  { username: 'MINA1', empresa: 'Mina Media Luna' },
  { username: 'MINA2', empresa: 'Minera Capela' },
  { username: 'MINA3', empresa: 'Mina El Limón' },
]

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD
if (!DEFAULT_PASSWORD || DEFAULT_PASSWORD.length < 8) {
  console.error('SEED_USER_PASSWORD debe tener al menos 8 caracteres.')
  process.exit(1)
}

async function main() {
  for (const u of USERS) {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    await db.collection('usuarios').doc(u.username).set({
      username: u.username,
      empresa: u.empresa,
      password: hash,
      createdAt: new Date().toISOString(),
    })
    console.log(`Usuario creado: ${u.username} / ${u.empresa}`)
  }
}

main().catch(console.error)
