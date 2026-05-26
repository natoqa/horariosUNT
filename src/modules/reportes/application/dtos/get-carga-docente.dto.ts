import { z } from 'zod';

export const getCargaDocenteSchema = z.object({
  periodoId: z.string().uuid('ID de periodo invalido'),
});

export type GetCargaDocenteDTO = z.infer<typeof getCargaDocenteSchema>;
