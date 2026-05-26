import { z } from 'zod';
import {
  CATEGORIAS_DOCENTE,
  REGIMENES_DOCENTE,
  CONDICIONES_DOCENTE,
} from '@/shared/constants/categories';

export const updateDocenteSchema = z.object({
  id: z.string().uuid('ID de docente inválido'),
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres').optional(),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres').optional(),
  correo: z.string().email('Ingrese un correo electrónico válido').optional(),
  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 caracteres')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .optional()
    .or(z.literal('')),
  categoria: z
    .enum(CATEGORIAS_DOCENTE, {
      message: 'Seleccione una categoría válida',
    })
    .optional(),
  regimen: z
    .enum(REGIMENES_DOCENTE, {
      message: 'Seleccione un régimen válido',
    })
    .optional(),
  condicion: z
    .enum(CONDICIONES_DOCENTE, {
      message: 'Seleccione una condición válida',
    })
    .optional(),
  fechaIngreso: z
    .string()
    .min(1, 'La fecha de ingreso es requerida')
    .refine((val) => new Date(val) <= new Date(), {
      message: 'La fecha de ingreso no puede ser futura',
    })
    .optional(),
  cargaMaxima: z.coerce
    .number()
    .int('La carga máxima debe ser un número entero')
    .min(1, 'La carga máxima debe ser al menos 1')
    .max(40, 'La carga máxima no puede exceder 40')
    .optional(),
});

export type UpdateDocenteDTO = z.infer<typeof updateDocenteSchema>;
