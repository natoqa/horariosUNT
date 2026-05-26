import { z } from 'zod';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';

export const updateAsignacionSchema = z.object({
  asignacionId: z.string().uuid('ID de asignación inválido'),
  docenteId: z.string().uuid('ID de docente inválido').optional(),
  aulaId: z.string().uuid('ID de aula inválido').optional(),
  dia: z.enum(DIAS_SEMANA, { message: 'Día inválido' }).optional(),
  bloque: z.enum(BLOQUES_HORARIOS, { message: 'Bloque horario inválido' }).optional(),
  motivo: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
});

export type UpdateAsignacionDTO = z.infer<typeof updateAsignacionSchema>;
