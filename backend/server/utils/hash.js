import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SALT_ROUNDS = 10

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

const esBcrypt = (hash) =>
  hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')

export async function compararPassword(password, hash) {
  if (esBcrypt(hash)) return bcrypt.compare(password, hash)
  const hashAntiguo = crypto.createHash('sha256').update(password).digest('hex')
  return hashAntiguo === hash
}
