import { z } from 'zod'

const anioSchema = z.object({
  oro: z.string().optional().default(''),
  plata: z.string().optional().default(''),
  cobre: z.string().optional().default(''),
  plomo: z.string().optional().default(''),
  zinc: z.string().optional().default(''),
})

const esgConceptoSchema = z.object({
  '2021': z.string().optional().default(''),
  '2022': z.string().optional().default(''),
  '2023': z.string().optional().default(''),
  '2024': z.string().optional().default(''),
  '2025': z.string().optional().default(''),
  '2026': z.string().optional().default(''),
  comentarios: z.string().optional().default(''),
})

export const crearFormularioSchema = z.object({
  empresaMatriz: z.string().optional().default(''),
  subsidiaria: z.string().optional().default(''),
  unidadMinera: z.string().optional().default(''),
  tipoMinado: z.string().optional().default(''),
  fechaInicio: z.string().optional().default(''),
  vidaUtil: z.string().optional().default(''),
  capacidad: z.string().optional().default(''),
  produccion: z
    .object({
      '2021': anioSchema.optional().default({}),
      '2022': anioSchema.optional().default({}),
      '2023': anioSchema.optional().default({}),
      '2024': anioSchema.optional().default({}),
      '2025': anioSchema.optional().default({}),
      '2026': anioSchema.optional().default({}),
    })
    .optional()
    .default({}),
  esg: z
    .object({
      'consumo-agua': esgConceptoSchema.optional().default({}),
      co2: esgConceptoSchema.optional().default({}),
      energia: esgConceptoSchema.optional().default({}),
      accidentes: esgConceptoSchema.optional().default({}),
      'inversion-social': esgConceptoSchema.optional().default({}),
      plantas: esgConceptoSchema.optional().default({}),
    })
    .optional()
    .default({}),
  comentarios: z.string().optional().default(''),
})
