export function normalizarFecha(createdAt) {
  if (!createdAt) return null
  if (typeof createdAt === 'string') return createdAt
  if (createdAt._seconds) return new Date(createdAt._seconds * 1000).toISOString()
  return null
}
