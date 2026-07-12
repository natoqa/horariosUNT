import { z } from 'zod';
import { ACTIVIDADES_NO_LECTIVAS } from '../../domain/entities/carga-no-lectiva.entity';

const actividadSchema = z.object({
  tipo: z.enum(ACTIVIDADES_NO_LECTIVAS),
  horas: z.coerce.number().min(0),
  detalles: z.string(),
}).superRefine((data, ctx) => {
  if (data.horas > 0 && data.detalles.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'El campo "Detalles" es obligatorio cuando la actividad tiene horas asignadas.',
      path: ['detalles'],
    });
  }
});

export const saveActividadesCargaNoLectivaSchema = z.object({
  periodoId: z.string().uuid(),
  actividades: z.array(actividadSchema).length(ACTIVIDADES_NO_LECTIVAS.length),
});

export type SaveActividadesCargaNoLectivaDTO = z.infer<typeof saveActividadesCargaNoLectivaSchema>;
