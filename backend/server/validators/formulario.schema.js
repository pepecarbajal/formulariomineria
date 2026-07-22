import { z } from 'zod'

const anioSchema = z.object({
  oro: z.string().optional().default(''),
  plata: z.string().optional().default(''),
  cobre: z.string().optional().default(''),
  plomo: z.string().optional().default(''),
  zinc: z.string().optional().default(''),
})

const esgConceptoSchema = z.object({
  '2023': z.string().optional().default(''),
  '2024': z.string().optional().default(''),
  '2025': z.string().optional().default(''),
  '2026': z.string().optional().default(''),
  comentarios: z.string().optional().default(''),
})

const empleadoAnualSchema = z.object({
  mujeres: z.string().optional().default(''),
  hombres: z.string().optional().default(''),
})

const socialCategoriaSchema = z.object({
  '2023': empleadoAnualSchema.optional().default({}),
  '2024': empleadoAnualSchema.optional().default({}),
  '2025': empleadoAnualSchema.optional().default({}),
  '2026': empleadoAnualSchema.optional().default({}),
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
      '2023': anioSchema.optional().default({}),
      '2024': anioSchema.optional().default({}),
      '2025': anioSchema.optional().default({}),
      '2026': anioSchema.optional().default({}),
    })
    .optional()
    .default({}),
  esg: z
    .object({
      incidentes: esgConceptoSchema.optional().default({}),
      cumplimiento: esgConceptoSchema.optional().default({}),
      'agua-reciclada': esgConceptoSchema.optional().default({}),
      'reduccion-gei': esgConceptoSchema.optional().default({}),
      reforestacion: esgConceptoSchema.optional().default({}),
      inversion: esgConceptoSchema.optional().default({}),
    })
    .optional()
    .default({}),
  social: z
    .object({
      empresa: socialCategoriaSchema.optional().default({}),
      contratistas: socialCategoriaSchema.optional().default({}),
      comunidades: socialCategoriaSchema.optional().default({}),
      guerrero: socialCategoriaSchema.optional().default({}),
    })
    .optional()
    .default({}),
  capacitacionData: z
    .object({
      capacitacion: z
        .object({
          '2023': empleadoAnualSchema.optional().default({}),
          '2024': empleadoAnualSchema.optional().default({}),
          '2025': empleadoAnualSchema.optional().default({}),
          '2026': empleadoAnualSchema.optional().default({}),
        })
        .optional()
        .default({}),
      rotacion: z
        .object({
          '2023': z.object({ mujeres: z.string().optional().default(''), hombres: z.string().optional().default('') }).optional().default({}),
          '2024': z.object({ mujeres: z.string().optional().default(''), hombres: z.string().optional().default('') }).optional().default({}),
          '2025': z.object({ mujeres: z.string().optional().default(''), hombres: z.string().optional().default('') }).optional().default({}),
        })
        .optional()
        .default({}),
    })
    .optional()
    .default({}),
  comentarios: z.string().optional().default(''),
})
