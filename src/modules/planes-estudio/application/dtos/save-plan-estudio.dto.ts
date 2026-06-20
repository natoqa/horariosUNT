import { z } from 'zod';

export const savePlanEstudioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  anio: z.coerce.number().int().min(1900).max(2100, 'El año debe estar entre 1900 y 2100'),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  fechaPublicacion: z.string().optional(),
});

export type SavePlanEstudioInput = z.infer<typeof savePlanEstudioSchema>;
