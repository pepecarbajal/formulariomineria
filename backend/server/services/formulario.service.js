import * as formularioRepo from '../repositories/formulario.repo.js'

export async function enviar(data, usuario) {
  const id = await formularioRepo.add({
    ...data,
    username: usuario.username,
    empresa: usuario.empresa,
    createdAt: new Date().toISOString(),
  })
  return { id }
}

export async function listar(usuario, queryUsername) {
  if (usuario.rol === 'empresa') {
    return formularioRepo.findByUsername(usuario.username)
  }
  if (queryUsername) {
    return formularioRepo.findByUsername(queryUsername)
  }
  return formularioRepo.findAll()
}
