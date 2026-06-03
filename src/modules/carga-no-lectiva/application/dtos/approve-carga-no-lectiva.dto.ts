import { z } from 'zod';

export const approveCargaNoLectivaSchema = z.object({
  cargaId: z.string().uuid(),
});

export type ApproveCargaNoLectivaDTO = z.infer<typeof approveCargaNoLectivaSchema>;
