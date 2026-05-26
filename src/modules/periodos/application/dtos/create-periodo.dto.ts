import { z } from 'zod';

export const createPeriodoSchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    tipoCiclo: z.enum(['Impar', 'Par'], { message: 'Seleccione el tipo de ciclo' }),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().min(1, 'La fecha de fin es requerida'),
    availabilityDeadline: z.string().min(1, 'La fecha límite es requerida'),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  })
  .refine(
    (data) => new Date(data.availabilityDeadline) < new Date(data.startDate),
    {
      message:
        'La fecha límite de disponibilidad debe ser anterior a la fecha de inicio del período',
      path: ['availabilityDeadline'],
    },
  );

export type CreatePeriodoDTO = z.infer<typeof createPeriodoSchema>;
