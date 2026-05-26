import { z } from 'zod';
import { ESTADOS_PERIODO } from '@/shared/constants/period-states';

export const changeStateSchema = z.object({
  periodoId: z.string().min(1, 'ID es requerido'),
  newState: z.enum(ESTADOS_PERIODO),
});

export type ChangeStateDTO = z.infer<typeof changeStateSchema>;
