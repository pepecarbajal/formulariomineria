import { Router } from 'express'
import { validar } from '../middleware/validate.js'
import { loginAdminSchema, loginEmpresaSchema } from '../validators/auth.schema.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

router.post('/admin/login', validar(loginAdminSchema), authController.loginAdmin)
router.post('/auth/empresa/login', validar(loginEmpresaSchema), authController.loginEmpresa)

export default router
