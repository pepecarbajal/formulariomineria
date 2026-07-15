import * as formularioService from '../services/formulario.service.js'

export async function enviar(req, res, next) {
  try {
    const result = await formularioService.enviar(req.body, req.usuario)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listar(req, res, next) {
  try {
    const result = await formularioService.listar(req.usuario, req.query.username)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
