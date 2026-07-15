import * as authService from '../services/auth.service.js'

export async function loginAdmin(req, res, next) {
  try {
    const result = await authService.loginAdmin(req.body.email, req.body.password)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function loginEmpresa(req, res, next) {
  try {
    const result = await authService.loginEmpresa(req.body.username, req.body.password)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
