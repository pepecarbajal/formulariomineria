import { db } from '../firebase.js'

const docRef = (email) => db.collection('admin').doc(email)

export async function findByEmail(email) {
  const doc = await docRef(email).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}
