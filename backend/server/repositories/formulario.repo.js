import { db } from '../firebase.js'

const coleccion = () => db.collection('formularios')

export async function add(data) {
  const docRef = await coleccion().add(data)
  return docRef.id
}

export async function findAll(orderByField = 'createdAt', direction = 'desc') {
  const snapshot = await coleccion().orderBy(orderByField, direction).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function findByUsername(username, orderByField = 'createdAt', direction = 'desc') {
  const snapshot = await coleccion()
    .where('username', '==', username)
    .orderBy(orderByField, direction)
    .get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function raw() {
  const snapshot = await coleccion().get()
  return snapshot.docs.map((d) => d.data())
}
