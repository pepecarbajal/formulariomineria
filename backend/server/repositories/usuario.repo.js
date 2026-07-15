import { db } from '../firebase.js'

const coleccion = () => db.collection('usuarios')

export async function findAll() {
  const snapshot = await coleccion().get()
  return snapshot.docs.map((doc) => {
    const { password, ...data } = doc.data()
    return { id: doc.id, ...data }
  })
}

export async function findByUsername(username) {
  const doc = await coleccion().doc(username).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

export async function create(username, data) {
  await coleccion().doc(username).set(data)
  return { username, ...data }
}

export async function remove(username) {
  await coleccion().doc(username).delete()
}
