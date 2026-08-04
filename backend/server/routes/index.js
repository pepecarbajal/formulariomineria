import { Router } from 'express'
import authRoutes from './auth.routes.js'
import usuarioRoutes from './usuario.routes.js'
import formularioRoutes from './formulario.routes.js'

const router = Router()

router.use(authRoutes)
router.use('/usuarios', usuarioRoutes)
router.use('/formularios', formularioRoutes)

export default router
