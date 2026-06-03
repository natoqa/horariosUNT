import { z } from 'zod';
import { ACTIVIDADES_NO_LECTIVAS } from '../../domain/entities/carga-no-lectiva.entity';

const actividadSchema = z.object({
  tipo: z.enum(ACTIVIDADES_NO_LECTIVAS),
  horas: z.coerce.number().min(0),
  detalles: z.string().min(1, 'Debe describir los detalles de la actividad.'),
});

export const saveActividadesCargaNoLectivaSchema = z.object({
  periodoId: z.string().uuid(),
  actividades: z.array(actividadSchema).length(ACTIVIDADES_NO_LECTIVAS.length),
});

export type SaveActividadesCargaNoLectivaDTO = z.infer<typeof saveActividadesCargaNoLectivaSchema>;
