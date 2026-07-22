import { z } from 'zod'

const numeroValido = z.string().regex(/^\d+(\.\d+)?$/).optional().default('')

const anioSchema = z.object({
  oro: numeroValido,
  plata: numeroValido,
  cobre: numeroValido,
  plomo: numeroValido,
  zinc: numeroValido,
})

const esgConceptoSchema = z.object({
  '2023': numeroValido,
  '2024': numeroValido,
  '2025': numeroValido,
  '2026': numeroValido,
  comentarios: z.string().max(2000).optional().default(''),
})

const empleadoAnualSchema = z.object({
  mujeres: numeroValido,
  hombres: numeroValido,
})

const socialCategoriaSchema = z.object({
  '2023': empleadoAnualSchema.optional().default({}),
  '2024': empleadoAnualSchema.optional().default({}),
  '2025': empleadoAnualSchema.optional().default({}),
  '2026': empleadoAnualSchema.optional().default({}),
})

export const crearFormularioSchema = z.object({
  empresaMatriz: z.string().max(300).optional().default(''),
  subsidiaria: z.string().max(300).optional().default(''),
  unidadMinera: z.string().max(300).optional().default(''),
  tipoMinado: z.string().max(50).optional().default(''),
  fechaInicio: z.string().max(20).optional().default(''),
  vidaUtil: numeroValido,
  capacidad: numeroValido,
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
          '2023': z.object({ mujeres: numeroValido, hombres: numeroValido }).optional().default({}),
          '2024': z.object({ mujeres: numeroValido, hombres: numeroValido }).optional().default({}),
          '2025': z.object({ mujeres: numeroValido, hombres: numeroValido }).optional().default({}),
        })
        .optional()
        .default({}),
    })
    .optional()
    .default({}),
  comentarios: z.string().max(2000).optional().default(''),
})
