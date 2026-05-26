import { z } from 'zod';

export const generateHorarioSchema = z.object({
  periodoId: z.string().uuid('ID de período inválido'),
  forceWithoutFullAvailability: z.boolean().default(false),
});

export type GenerateHorarioDTO = z.infer<typeof generateHorarioSchema>;
