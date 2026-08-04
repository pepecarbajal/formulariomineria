import config from '../config/index.js'
import { generarToken } from '../middleware/auth.js'
import { compararPassword } from '../utils/hash.js'
import * as usuarioRepo from '../repositories/usuario.repo.js'
import * as adminRepo from '../repositories/admin.repo.js'
import { AppError } from '../middleware/errorHandler.js'

// Hash de un password ficticio para igualar el tiempo de verificación
// cuando el usuario no existe y evitar la enumeración de cuentas.
const DUMMY_HASH = '$2b$10$BrzolPyNzoBwqKEMw/uC4uvaCyOQ.GPWyXt5addPTu4mhCKMjqIjO'

export async function loginAdmin(email, password) {
  const admin = await adminRepo.findByEmail(email)

  const valido = await compararPassword(password, admin?.passwordHash || DUMMY_HASH)
  if (!admin || !valido) throw new AppError(401, 'Credenciales incorrectas')

  const token = generarToken({ email: admin.email, rol: 'admin' })
  return { token, email: admin.email }
}

export async function loginEmpresa(username, password) {
  const user = await usuarioRepo.findByUsername(username)

  const valido = await compararPassword(password, user?.password || DUMMY_HASH)
  if (!user || !valido) throw new AppError(401, 'Usuario o contraseña incorrectos')

  const token = generarToken({ username: user.username, empresa: user.empresa, rol: 'empresa' })
  return { token, username: user.username, empresa: user.empresa }
}
