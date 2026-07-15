import { z } from 'zod'

export const crearUsuarioSchema = z.object({
  empresa: z.string().min(1, 'La empresa es obligatoria'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(30),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})
