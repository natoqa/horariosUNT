import { z } from 'zod';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { DISPONIBILIDAD_ESTADOS } from '../../domain/entities/disponibilidad.entity';

const disponibilidadBlockSchema = z.object({
  dia: z.enum(DIAS_SEMANA, { message: 'Día inválido' }),
  bloque: z.enum(BLOQUES_HORARIOS, { message: 'Bloque horario inválido' }),
  estado: z.enum(DISPONIBILIDAD_ESTADOS, { message: 'Estado inválido' }),
});

export const saveDisponibilidadSchema = z.object({
  periodoId: z.string().uuid('ID de período inválido'),
  blocks: z
    .array(disponibilidadBlockSchema)
    .min(1, 'Debe registrar al menos un bloque de disponibilidad'),
});

export type SaveDisponibilidadDTO = z.infer<typeof saveDisponibilidadSchema>;
