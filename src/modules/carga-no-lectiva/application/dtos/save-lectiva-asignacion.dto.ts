import { z } from 'zod';

export const saveLectivaAsignacionSchema = z.object({
  periodoId: z.string().uuid(),
  docenteId: z.string().uuid(),
  horasLectivasAsignadas: z.coerce.number().min(0),
});

export type SaveLectivaAsignacionDTO = z.infer<typeof saveLectivaAsignacionSchema>;
