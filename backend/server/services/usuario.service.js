import * as usuarioRepo from '../repositories/usuario.repo.js'
import { hashPassword } from '../utils/hash.js'
import { AppError } from '../middleware/errorHandler.js'

export async function listar() {
  return usuarioRepo.findAll()
}

export async function crear({ empresa, username, password }) {
  const existe = await usuarioRepo.findByUsername(username)
  if (existe) throw new AppError(409, 'El usuario ya existe')
  const passwordHash = await hashPassword(password)
  await usuarioRepo.create(username, {
    empresa,
    username,
    password: passwordHash,
    createdAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function eliminar(username) {
  await usuarioRepo.remove(username)
  return { success: true }
}
