import { z } from 'zod';

export const approveHorarioSchema = z.object({
  horarioId: z.string().uuid('ID de horario inválido'),
});

export type ApproveHorarioDTO = z.infer<typeof approveHorarioSchema>;
