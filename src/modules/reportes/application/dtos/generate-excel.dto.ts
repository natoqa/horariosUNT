import { z } from 'zod';

export const generateExcelSchema = z.object({
  periodoId: z.string().uuid('ID de período inválido'),
});

export type GenerateExcelDTO = z.infer<typeof generateExcelSchema>;
