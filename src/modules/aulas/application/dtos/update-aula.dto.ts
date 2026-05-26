import { z } from 'zod';

export const updateAulaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  pabellon: z
    .string()
    .max(50, 'El pabellón no puede exceder los 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  piso: z.coerce
    .number()
    .int('El piso debe ser un número entero')
    .min(0, 'El piso no puede ser negativo')
    .max(10, 'El piso no puede ser mayor que 10')
    .optional()
    .nullable(),
  capacidad: z.coerce
    .number()
    .int('La capacidad debe ser un número entero')
    .min(1, 'La capacidad debe ser al menos de 1 estudiante')
    .max(500, 'La capacidad no puede exceder 500 estudiantes'),
  tipo: z.enum(['Aula Teórica', 'Laboratorio de Cómputo', 'Laboratorio Especializado', 'Auditorio'], {
    message: 'Seleccione un tipo de espacio físico válido',
  }),
  equipamiento: z
    .string()
    .transform((val) => {
      if (!val) return [];
      return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    })
    .optional(),
  estado: z.enum(['Activa', 'Inactiva', 'Mantenimiento'], {
    message: 'Seleccione un estado válido para el aula',
  }),
});

export type UpdateAulaDTO = z.infer<typeof updateAulaSchema>;
