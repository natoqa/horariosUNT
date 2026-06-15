import { z } from 'zod';
import { REPORT_FILTER_TYPES } from '../../domain/entities/report-config.entity';

export const generatePdfSchema = z.object({
  periodoId: z.string().uuid('ID de período inválido'),
  filterType: z.enum(REPORT_FILTER_TYPES, { message: 'Tipo de filtro inválido' }),
  filterId: z.string().min(1, 'ID de filtro inválido').optional(),
}).refine(
  (data) => data.filterType === 'all' || data.filterId,
  { message: 'Debe seleccionar un valor para el filtro', path: ['filterId'] },
);

export type GeneratePdfDTO = z.infer<typeof generatePdfSchema>;
