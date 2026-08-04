import * as formularioRepo from '../repositories/formulario.repo.js'
import ExcelJS from 'exceljs'
import { AppError } from '../middleware/errorHandler.js'
import {
  METALES,
  YEARS_ESG,
  YEARS_CAPACITACION,
  YEARS_ROTACION,
  ESG_METRICS,
  SOCIAL_CATEGORIES,
} from '../../../shared/catalogo.js'
const { Workbook } = ExcelJS

export async function enviar(data, usuario) {
  const existente = await formularioRepo.findLatestByUsername(usuario.username)
  if (existente) {
    await formularioRepo.update(existente.id, {
      ...data,
      username: usuario.username,
      empresa: usuario.empresa,
      updatedAt: new Date().toISOString(),
    })
    return { id: existente.id }
  }
  const id = await formularioRepo.add({
    ...data,
    username: usuario.username,
    empresa: usuario.empresa,
    createdAt: new Date().toISOString(),
  })
  return { id }
}

export async function actualizar(id, data, usuario) {
  const existente = await formularioRepo.findById(id)
  if (!existente) {
    throw new AppError(404, 'Formulario no encontrado')
  }
  if (existente.username !== usuario.username) {
    throw new AppError(403, 'No tienes permiso para modificar este formulario')
  }
  await formularioRepo.update(id, {
    ...data,
    username: usuario.username,
    empresa: usuario.empresa,
    updatedAt: new Date().toISOString(),
  })
  return { id }
}

export async function obtenerPropio(usuario) {
  if (usuario.rol !== 'empresa') return null
  return formularioRepo.findLatestByUsername(usuario.username)
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

const ANOS = YEARS_ESG
const ANOS_ROTACION = YEARS_ROTACION
const METALES_EXCEL = METALES.map((m) => ({ key: m.key, label: `${m.label} (${m.unit})` }))
const ESG_CATS = ESG_METRICS.map((m) => ({ key: m.id, label: m.label, unit: m.excelUnit || m.unit }))
const SOCIAL_CATS = SOCIAL_CATEGORIES.map((c) => ({ key: c.id, label: c.label }))

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8A1538' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
}

const CELL_STYLE = {
  border: {
    top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
    bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
    left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
    right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
  },
}

function addHeaderRow(sheet, headers) {
  const row = sheet.addRow(headers)
  row.eachCell((cell) => {
    cell.style = HEADER_STYLE
  })
  return row
}

function estilizarFila(sheet, rowNumber, columnCount) {
  for (let c = 1; c <= columnCount; c++) {
    const cell = sheet.getCell(rowNumber, c)
    cell.style = { ...cell.style, ...CELL_STYLE }
  }
}

export async function exportarExcel() {
  const docs = await formularioRepo.findAll('createdAt', 'asc')
  if (docs.length === 0) return { buffer: null, filename: '' }

  const workbook = new Workbook()

  /* Hoja 1: Datos Generales */
  const hojaGeneral = workbook.addWorksheet('Datos Generales', { views: [{ state: 'frozen', ySplit: 1 }] })
  addHeaderRow(hojaGeneral, [
    'Empresa', 'Usuario', 'Empresa Matriz', 'País de Origen del Capital', 'Subsidiaria', 'Unidad Minera',
    'Tipo de Minado', 'Fecha de Inicio', 'Vida Útil (Años)', 'Capacidad (t/día)', 'Fecha de Envío',
  ])
  docs.forEach((d) => {
    const row = hojaGeneral.addRow([
      d.empresa || '', d.username || '', d.empresaMatriz || '', d.paisOrigen || '', d.subsidiaria || '',
      d.unidadMinera || '', d.tipoMinado || '', d.fechaInicio || '',
      d.vidaUtil || '', d.capacidad || '', d.createdAt || '',
    ])
    estilizarFila(hojaGeneral, row.number, 11)
  })
  hojaGeneral.columns.forEach((col, i) => {
    col.width = [18, 12, 24, 26, 24, 24, 16, 14, 16, 16, 22][i] || 16
  })

  /* Hoja 2: Producción */
  const hojaProduccion = workbook.addWorksheet('Producción', { views: [{ state: 'frozen', ySplit: 1 }] })
  addHeaderRow(hojaProduccion, ['Empresa', 'Año', ...METALES_EXCEL.map((m) => m.label)])
  docs.forEach((d) => {
    const prod = d.produccion || {}
    ANOS.forEach((a) => {
      const anio = prod[a] || {}
      const row = hojaProduccion.addRow([d.empresa || '', a, ...METALES_EXCEL.map((m) => (anio[m.key] === '' || anio[m.key] === undefined || anio[m.key] === null ? '' : anio[m.key]))])
      estilizarFila(hojaProduccion, row.number, 7)
    })
  })
  hojaProduccion.columns.forEach((col, i) => {
    col.width = [22, 10, 14, 14, 14, 14, 14][i] || 14
  })

  /* Hoja 3: Indicadores ESG */
  const hojaESG = workbook.addWorksheet('Indicadores ESG', { views: [{ state: 'frozen', ySplit: 1 }] })
  addHeaderRow(hojaESG, ['Empresa', 'Concepto', 'Unidad', ...ANOS, 'Acciones 2023-2026'])
  docs.forEach((d) => {
    const esg = d.esg || {}
    ESG_CATS.forEach((cat) => {
      const data = esg[cat.key] || {}
      const row = hojaESG.addRow([
        d.empresa || '', cat.label, cat.unit,
        ...ANOS.map((a) => (data[a] === '' || data[a] === undefined || data[a] === null ? '' : data[a])),
        data.comentarios || '',
      ])
      estilizarFila(hojaESG, row.number, 9)
    })
  })
  hojaESG.columns.forEach((col, i) => {
    col.width = [22, 26, 12, 12, 12, 12, 12, 30][i] || 16
  })

  /* Hoja 4: Impacto Social */
  const hojaSocial = workbook.addWorksheet('Impacto Social', { views: [{ state: 'frozen', ySplit: 1 }] })
  addHeaderRow(hojaSocial, ['Empresa', 'Categoría', 'Año', 'Mujeres', 'Hombres', 'Total', '% Mujeres', '% Hombres'])
  docs.forEach((d) => {
    const social = d.social || {}
    SOCIAL_CATS.forEach((cat) => {
      ANOS.forEach((a) => {
        const entry = social[cat.key]?.[a] || {}
        const m = parseFloat(entry.mujeres) || 0
        const h = parseFloat(entry.hombres) || 0
        const total = m + h
        const pM = total > 0 ? +((m / total) * 100).toFixed(1) : 0
        const pH = total > 0 ? +((h / total) * 100).toFixed(1) : 0
        const row = hojaSocial.addRow([d.empresa || '', cat.label, a, m || '', h || '', total, pM, pH])
        estilizarFila(hojaSocial, row.number, 8)
      })
    })
  })
  hojaSocial.columns.forEach((col, i) => {
    col.width = [22, 16, 10, 12, 12, 12, 12, 12][i] || 14
  })

  /* Hoja 5: Capacitación y Rotación */
  const hojaCapacitacion = workbook.addWorksheet('Capacitación y Rotación', { views: [{ state: 'frozen', ySplit: 1 }] })
  addHeaderRow(hojaCapacitacion, ['Empresa', 'Sección', 'Año', 'Mujeres', 'Hombres', 'Total'])
  docs.forEach((d) => {
    const cap = d.capacitacionData?.capacitacion || {}
    ANOS.forEach((a) => {
      const entry = cap[a] || {}
      const m = parseFloat(entry.mujeres) || 0
      const h = parseFloat(entry.hombres) || 0
      const total = m + h
      const row = hojaCapacitacion.addRow([d.empresa || '', 'Capacitación en Seguridad (hrs)', a, m || '', h || '', total || ''])
      estilizarFila(hojaCapacitacion, row.number, 6)
    })
    const rot = d.capacitacionData?.rotacion || {}
    ANOS_ROTACION.forEach((a) => {
      const entry = rot[a] || {}
      const m = parseFloat(entry.mujeres) || 0
      const h = parseFloat(entry.hombres) || 0
      const total = m > 0 || h > 0 ? +((m + h) / 2).toFixed(1) : ''
      const row = hojaCapacitacion.addRow([d.empresa || '', 'Tasa de Rotación (%)', a, m || '', h || '', total])
      estilizarFila(hojaCapacitacion, row.number, 6)
    })
  })
  hojaCapacitacion.columns.forEach((col, i) => {
    col.width = [22, 32, 10, 12, 12, 12][i] || 14
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `Reportes_Mineria_${new Date().toISOString().split('T')[0]}.xlsx`
  return { buffer, filename }
}
