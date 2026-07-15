import { Router } from 'express'
import { verificarToken, soloAdmin } from '../middleware/auth.js'
import * as estadisticaController from '../controllers/estadistica.controller.js'

const router = Router()

router.use(verificarToken, soloAdmin)
router.get('/', estadisticaController.obtener)

export default router
