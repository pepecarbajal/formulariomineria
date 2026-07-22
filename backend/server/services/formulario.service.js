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

function escapeCSV(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function exportarCSV() {
  const docs = await formularioRepo.findAll('createdAt', 'asc')
  if (docs.length === 0) return { csv: '', filename: '' }

  const ANOS = ['2023', '2024', '2025', '2026']
  const METALES = ['oro', 'plata', 'cobre', 'plomo', 'zinc']
  const ESG_CATS = [
    { key: 'incidentes', label: 'Incidentes' },
    { key: 'cumplimiento', label: 'Cumplimiento' },
    { key: 'agua-reciclada', label: 'AguaReciclada' },
    { key: 'reduccion-gei', label: 'ReduccionGEI' },
    { key: 'reforestacion', label: 'Reforestacion' },
    { key: 'inversion', label: 'Inversion' },
  ]
  const SOCIAL_CATS = ['empresa', 'contratistas', 'comunidades', 'guerrero']

  const headers = [
    'ID', 'Empresa', 'Usuario', 'FechaEnvio',
    'EmpresaMatriz', 'Subsidiaria', 'UnidadMinera', 'TipoMinado',
    'FechaInicio', 'VidaUtil', 'Capacidad',
    ...ANOS.flatMap(a => METALES.map(m => `Prod_${a}_${m}`)),
    ...ESG_CATS.flatMap(esg => [
      ...ANOS.map(a => `ESG_${esg.label}_${a}`),
      `ESG_${esg.label}_Comentarios`,
    ]),
    ...SOCIAL_CATS.flatMap(cat => ANOS.flatMap(a => [
      `Social_${cat}_${a}_Mujeres`,
      `Social_${cat}_${a}_Hombres`,
      `Social_${cat}_${a}_Total`,
      `Social_${cat}_${a}_%M`,
      `Social_${cat}_${a}_%H`,
    ])),
    ...ANOS.flatMap(a => [
      `Capacitacion_${a}_Mujeres`,
      `Capacitacion_${a}_Hombres`,
      `Capacitacion_${a}_Total`,
      `Capacitacion_${a}_%M`,
      `Capacitacion_${a}_%H`,
    ]),
    ...['2023', '2024', '2025'].flatMap(a => [
      `Rotacion_${a}_Mujeres`,
      `Rotacion_${a}_Hombres`,
    ]),
    'Comentarios',
  ]

  const rows = docs.map(d => {
    const prod = d.produccion || {}
    const esg = d.esg || {}
    const social = d.social || {}
    const cap = d.capacitacionData?.capacitacion || {}
    const rot = d.capacitacionData?.rotacion || {}
    return [
      d.id || '',
      d.empresa || '', d.username || '', d.createdAt || '',
      d.empresaMatriz || '', d.subsidiaria || '', d.unidadMinera || '', d.tipoMinado || '',
      d.fechaInicio || '', d.vidaUtil || '', d.capacidad || '',
      ...ANOS.flatMap(a => {
        const anio = prod[a] || {}
        return METALES.map(m => anio[m] || '')
      }),
      ...ESG_CATS.flatMap(esgCat => {
        const cat = esg[esgCat.key] || {}
        return [
          ...ANOS.map(a => cat[a] || ''),
          cat.comentarios || '',
        ]
      }),
      ...SOCIAL_CATS.flatMap(cat => ANOS.flatMap(a => {
        const entry = social[cat]?.[a] || {}
        const m = parseFloat(entry.mujeres) || 0
        const h = parseFloat(entry.hombres) || 0
        const total = m + h
        const pM = total > 0 ? +((m / total) * 100).toFixed(1) : 0
        const pH = total > 0 ? +((h / total) * 100).toFixed(1) : 0
        return [
          entry.mujeres || '0',
          entry.hombres || '0',
          total,
          pM,
          pH,
        ]
      })),
      ...ANOS.flatMap(a => {
        const entry = cap[a] || {}
        const m = parseFloat(entry.mujeres) || 0
        const h = parseFloat(entry.hombres) || 0
        const total = m + h
        const pM = total > 0 ? +((m / total) * 100).toFixed(1) : 0
        const pH = total > 0 ? +((h / total) * 100).toFixed(1) : 0
        return [
          entry.mujeres || '0',
          entry.hombres || '0',
          total,
          pM,
          pH,
        ]
      }),
      ...['2023', '2024', '2025'].flatMap(a => {
        const entry = rot[a] || {}
        return [
          entry.mujeres || '0',
          entry.hombres || '0',
        ]
      }),
      d.comentarios || '',
    ].map(escapeCSV)
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  const filename = `Reportes_Mineria_${new Date().toISOString().split('T')[0]}.csv`
  return { csv, filename }
}
