import 'dotenv/config'
import app from './app.js'
import config from './config/index.js'

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${config.port}`)
})

function gracefulShutdown() {
  console.log('\nCerrando servidor...')
  server.close(() => {
    console.log('Servidor cerrado.')
    process.exit(0)
  })
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
