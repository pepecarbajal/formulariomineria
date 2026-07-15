export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = status === 500 ? 'Error interno del servidor' : err.message

  if (status === 500) {
    // Si es error de Firestore (índice faltante), mostrar mensaje útil en consola
    if (err.code === 9 && err.details?.includes('index')) {
      console.error('❌ Falta un índice compuesto en Firestore. Créalo aquí:')
      console.error(err.details.match(/https:\/\/console[^\s]+/)?.[0] || err.details)
    } else {
      console.error('[ERROR]', err)
    }
  }

  res.status(status).json({ error: message })
}

export class AppError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
