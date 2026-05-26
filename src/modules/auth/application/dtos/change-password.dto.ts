import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingrese su contraseña actual'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayúscula')
    .regex(/[0-9]/, 'Al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
