import { z } from 'zod';

export const updateCursoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  ciclo: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'], {
    message: 'Seleccione un ciclo académico válido del I al X',
  }),
  tipo: z.enum(['Teórico', 'Práctico', 'Teórico-Práctico'], {
    message: 'Seleccione un tipo de curso válido',
  }),
  horasTeoricas: z.coerce
    .number()
    .int('Las horas deben ser un número entero')
    .min(0, 'Las horas no pueden ser negativas')
    .max(20, 'Las horas teóricas no pueden exceder 20'),
  horasPracticas: z.coerce
    .number()
    .int('Las horas deben ser un número entero')
    .min(0, 'Las horas no pueden ser negativas')
    .max(20, 'Las horas prácticas no pueden exceder 20'),
  creditos: z.coerce
    .number()
    .int('Los créditos deben ser un número entero')
    .min(1, 'El curso debe tener al menos 1 crédito')
    .max(10, 'Los créditos no pueden exceder 10'),
  requiereLaboratorio: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  tipoLaboratorio: z
    .string()
    .max(50, 'El tipo de laboratorio no puede exceder 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  estado: z.enum(['Activo', 'Inactivo']),
  planEstudioId: z
    .string()
    .uuid('ID de plan de estudios inválido')
    .optional()
    .nullable()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.requiereLaboratorio && !data.tipoLaboratorio) {
      return false;
    }
    return true;
  },
  {
    message: 'Si el curso requiere laboratorio, debe especificar qué tipo de laboratorio.',
    path: ['tipoLaboratorio'],
  }
).refine(
  (data) => {
    if (data.tipo === 'Teórico' && data.horasTeoricas === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Un curso teórico debe tener al menos 1 hora teórica.',
    path: ['horasTeoricas'],
  }
).refine(
  (data) => {
    if (data.tipo === 'Práctico' && data.horasPracticas === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Un curso práctico debe tener al menos 1 hora práctica.',
    path: ['horasPracticas'],
  }
);

export type UpdateCursoDTO = z.infer<typeof updateCursoSchema>;
