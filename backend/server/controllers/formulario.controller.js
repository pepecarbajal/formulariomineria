import * as formularioService from '../services/formulario.service.js'

export async function enviar(req, res, next) {
  try {
    const result = await formularioService.enviar(req.body, req.usuario)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function actualizar(req, res, next) {
  try {
    const result = await formularioService.actualizar(req.params.id, req.body, req.usuario)
    res.json(result)
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

export async function obtenerPropio(req, res, next) {
  try {
    const result = await formularioService.obtenerPropio(req.usuario)
    res.json(result || {})
  } catch (err) {
    next(err)
  }
}

export async function exportar(req, res, next) {
  try {
    const { buffer, filename } = await formularioService.exportarExcel()
    if (!buffer) {
      return res.status(404).json({ error: 'No hay datos para exportar' })
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(Buffer.from(buffer))
  } catch (err) {
    next(err)
  }
}
