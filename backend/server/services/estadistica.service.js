import * as usuarioRepo from '../repositories/usuario.repo.js'
import * as formularioRepo from '../repositories/formulario.repo.js'
import { normalizarFecha } from '../utils/fecha.js'

const YEARS = ['2023', '2024', '2025', '2026']
const METALS = ['oro', 'plata', 'cobre', 'plomo', 'zinc']
const ESG_METRICS = ['incidentes', 'cumplimiento', 'agua-reciclada', 'reduccion-gei', 'reforestacion', 'inversion']

function promediar(formularios, year, campo, subcampo = null) {
  const values = formularios
    .map((f) => {
      const nivel1 = f[campo]?.[year]
      return subcampo ? nivel1?.[subcampo] : nivel1
    })
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map(Number)
    .filter((v) => !isNaN(v) && v > 0)
  return values.length
    ? +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
    : 0
}

function sumar(formularios, year, campo, subcampo = null) {
  const values = formularios
    .map((f) => {
      const nivel1 = f[campo]?.[year]
      return subcampo ? nivel1?.[subcampo] : nivel1
    })
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map(Number)
    .filter((v) => !isNaN(v) && v > 0)
  return values.length ? +values.reduce((a, b) => a + b, 0).toFixed(2) : 0
}

function calcTendencia(arr, key) {
  const values = arr.map((y) => y[key]).filter((v) => v > 0)
  if (values.length < 2) return 0
  const first = values[0]
  const last = values[values.length - 1]
  return first > 0 ? +(((last - first) / first) * 100).toFixed(1) : 0
}

export async function calcular() {
  const [usuarios, formulariosRaw] = await Promise.all([
    usuarioRepo.findAll(),
    formularioRepo.raw(),
  ])

  const formularios = formulariosRaw
  const totalFormularios = formularios.length
  const totalUsuarios = usuarios.length

  const usuariosConFormulario = new Set(formularios.map((f) => f.username).filter(Boolean))
  const completados = usuariosConFormulario.size
  const pendientes = Math.max(0, totalUsuarios - completados)

  const produccion = YEARS.map((year) => {
    const entry = { año: year }
    for (const metal of METALS) {
      entry[metal] = promediar(formularios, year, 'produccion', metal)
    }
    return entry
  })

  const produccionTotal = YEARS.map((year) => {
    const entry = { año: year }
    for (const metal of METALS) {
      entry[metal] = sumar(formularios, year, 'produccion', metal)
    }
    return entry
  })

  const esgPromedio = YEARS.map((year) => {
    const entry = { año: year }
    for (const metric of ESG_METRICS) {
      entry[metric] = promediar(formularios, year, 'esg', metric)
    }
    return entry
  })

  const tendencias = {}
  for (const metal of METALS) {
    tendencias[metal] = calcTendencia(produccion, metal)
  }

  const totalesMetal = {}
  for (const metal of METALS) {
    totalesMetal[metal] = +produccionTotal.reduce((acc, y) => acc + y[metal], 0).toFixed(2)
  }

  const formsPorEmpresa = {}
  formularios.forEach((f) => {
    const nombre = f.empresa || f.username
    if (!nombre) return
    if (!formsPorEmpresa[nombre]) formsPorEmpresa[nombre] = []
    formsPorEmpresa[nombre].push(f)
  })
  const companias = Object.keys(formsPorEmpresa).sort()

  function seriesPorEmpresa(campo, metrics = METALS) {
    const result = {}
    for (const metric of metrics) {
      result[metric] = YEARS.map((year) => {
        const entry = { año: year }
        for (const empresa of companias) {
          const values = formsPorEmpresa[empresa]
            .map((f) => f[campo]?.[year]?.[metric])
            .filter((v) => v !== undefined && v !== null && v !== '')
            .map(Number)
            .filter((v) => !isNaN(v) && v > 0)
          entry[empresa] = values.length ? +values.reduce((a, b) => a + b, 0).toFixed(2) : 0
        }
        return entry
      })
    }
    return result
  }

  const empresas = formularios.map((f) => ({
    empresa: f.empresa || f.username,
    fecha: normalizarFecha(f.createdAt) || '—',
  }))

  const formulariosPorMes = {}
  formularios.forEach((f) => {
    const fecha = normalizarFecha(f.createdAt)
    if (fecha) {
      const mes = fecha.substring(0, 7)
      formulariosPorMes[mes] = (formulariosPorMes[mes] || 0) + 1
    }
  })

  const produccionEmpresas = seriesPorEmpresa('produccion')
  const esgEmpresas = seriesPorEmpresa('esg', ESG_METRICS)

  return {
    totalFormularios,
    totalUsuarios,
    completados,
    pendientes,
    companias,
    produccion,
    produccionTotal,
    totalesMetal,
    tendencias,
    produccionEmpresas,
    esgPromedio,
    esgEmpresas,
    empresas,
    formulariosPorMes: Object.entries(formulariosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, cantidad]) => ({ mes, cantidad })),
  }
}
