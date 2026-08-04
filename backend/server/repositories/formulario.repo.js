import { db } from '../firebase.js'

const coleccion = () => db.collection('formularios')

export async function add(data) {
  const docRef = await coleccion().add(data)
  return docRef.id
}

export async function findAll(orderByField = 'createdAt', direction = 'desc', limit = 500) {
  let query = coleccion().orderBy(orderByField, direction)
  if (limit > 0) query = query.limit(limit)
  const snapshot = await query.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function findByUsername(username) {
  const snapshot = await coleccion()
    .where('username', '==', username)
    .get()
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  docs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return docs
}

export async function findLatestByUsername(username) {
  const docs = await findByUsername(username)
  return docs.length > 0 ? docs[0] : null
}

export async function update(id, data) {
  await coleccion().doc(id).update(data)
}

export async function findById(id) {
  const doc = await coleccion().doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

export async function removeByUsername(username) {
  const snapshot = await coleccion().where('username', '==', username).get()
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
}
