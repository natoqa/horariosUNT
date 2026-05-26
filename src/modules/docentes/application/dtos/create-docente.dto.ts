import { z } from 'zod';
import {
  CATEGORIAS_DOCENTE,
  REGIMENES_DOCENTE,
  CONDICIONES_DOCENTE,
} from '@/shared/constants/categories';

export const createDocenteSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d{8}$/, 'El DNI solo debe contener dígitos'),
  correo: z.string().email('Ingrese un correo electrónico válido'),
  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 caracteres')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .optional()
    .or(z.literal('')),
  categoria: z.enum(CATEGORIAS_DOCENTE, {
    message: 'Seleccione una categoría válida',
  }),
  regimen: z.enum(REGIMENES_DOCENTE, {
    message: 'Seleccione un régimen válido',
  }),
  condicion: z.enum(CONDICIONES_DOCENTE, {
    message: 'Seleccione una condición válida',
  }),
  fechaIngreso: z
    .string()
    .min(1, 'La fecha de ingreso es requerida')
    .refine((val) => new Date(val) <= new Date(), {
      message: 'La fecha de ingreso no puede ser futura',
    }),
  cargaMaxima: z.coerce
    .number()
    .int('La carga máxima debe ser un número entero')
    .min(1, 'La carga máxima debe ser al menos 1')
    .max(40, 'La carga máxima no puede exceder 40'),
});

export type CreateDocenteDTO = z.infer<typeof createDocenteSchema>;
