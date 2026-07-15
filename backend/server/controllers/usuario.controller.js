import * as usuarioService from '../services/usuario.service.js'

export async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar()
    res.json(usuarios)
  } catch (err) {
    next(err)
  }
}

export async function crear(req, res, next) {
  try {
    const result = await usuarioService.crear(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function eliminar(req, res, next) {
  try {
    const result = await usuarioService.eliminar(req.params.username)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
