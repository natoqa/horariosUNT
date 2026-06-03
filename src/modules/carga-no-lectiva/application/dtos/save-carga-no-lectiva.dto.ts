import { z } from 'zod';

export const saveCargaNoLectivaSchema = z.object({
  periodoId: z.string().uuid(),
  totalHoras: z.coerce.number().min(0),
});

export type SaveCargaNoLectivaDTO = z.infer<typeof saveCargaNoLectivaSchema>;
