import config from '../config/index.js'
import { generarToken } from '../middleware/auth.js'
import { compararPassword } from '../utils/hash.js'
import * as usuarioRepo from '../repositories/usuario.repo.js'
import * as adminRepo from '../repositories/admin.repo.js'
import { AppError } from '../middleware/errorHandler.js'

export async function loginAdmin(email, password) {
  const admin = await adminRepo.findByEmail(email)
  if (!admin) throw new AppError(401, 'Credenciales incorrectas')

  const valido = await compararPassword(password, admin.passwordHash)
  if (!valido) throw new AppError(401, 'Credenciales incorrectas')

  const token = generarToken({ email: admin.email, rol: 'admin' })
  return { token, email: admin.email }
}

export async function loginEmpresa(username, password) {
  const user = await usuarioRepo.findByUsername(username)
  if (!user) throw new AppError(401, 'Usuario o contraseña incorrectos')

  const valido = await compararPassword(password, user.password)
  if (!valido) throw new AppError(401, 'Usuario o contraseña incorrectos')

  const token = generarToken({ username: user.username, empresa: user.empresa, rol: 'empresa' })
  return { token, username: user.username, empresa: user.empresa }
}
