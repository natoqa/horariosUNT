import { z } from 'zod';

export const getDocenteHorarioSchema = z.object({
  periodoId: z.string().uuid('El ID del período debe ser un UUID válido.'),
});

export type GetDocenteHorarioDto = z.infer<typeof getDocenteHorarioSchema>;
