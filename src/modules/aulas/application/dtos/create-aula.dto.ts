import { z } from 'zod';

export const createAulaSchema = z.object({
  codigo: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(10, 'El código no puede exceder los 10 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'El código solo puede contener letras, números y guiones'),
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
});

export type CreateAulaDTO = z.infer<typeof createAulaSchema>;
