import * as estadisticaService from '../services/estadistica.service.js'

export async function obtener(req, res, next) {
  try {
    const result = await estadisticaService.calcular()
    res.json(result)
  } catch (err) {
    next(err)
  }
}
