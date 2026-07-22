import { Router } from 'express'
import { verificarToken, soloAdmin, soloEmpresa } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { crearFormularioSchema } from '../validators/formulario.schema.js'
import * as formularioController from '../controllers/formulario.controller.js'

const router = Router()

router.post('/', verificarToken, soloEmpresa, validar(crearFormularioSchema), formularioController.enviar)
router.get('/', verificarToken, formularioController.listar)
router.get('/mi-formulario', verificarToken, soloEmpresa, formularioController.obtenerPropio)
router.get('/export', verificarToken, soloAdmin, formularioController.exportar)

export default router
