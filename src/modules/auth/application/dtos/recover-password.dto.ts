import { z } from 'zod';

export const recoverPasswordSchema = z.object({
  email: z.string().email('Ingrese un correo institucional válido'),
});

export type RecoverPasswordDTO = z.infer<typeof recoverPasswordSchema>;
