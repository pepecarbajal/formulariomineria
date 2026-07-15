import { Router } from 'express'
import { verificarToken, soloAdmin } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { crearUsuarioSchema } from '../validators/usuario.schema.js'
import * as usuarioController from '../controllers/usuario.controller.js'

const router = Router()

router.use(verificarToken, soloAdmin)

router.get('/', usuarioController.listar)
router.post('/', validar(crearUsuarioSchema), usuarioController.crear)
router.delete('/:username', usuarioController.eliminar)

export default router
