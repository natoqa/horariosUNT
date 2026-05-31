import { z } from 'zod';

export const saveLectivaDeclaracionSchema = z.object({
  periodoId: z.string().uuid(),
  horasLectivasNoAsignadas: z.coerce.number().min(0),
  lectivaDeclarada: z.boolean(),
  declaracionLectiva: z.string().min(1, 'Debe indicar los detalles de la declaración lectiva.'),
});

export type SaveLectivaDeclaracionDTO = z.infer<typeof saveLectivaDeclaracionSchema>;
