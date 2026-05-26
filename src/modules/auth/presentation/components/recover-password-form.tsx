'use client'

import { useActionState } from 'react';
import { recoverPasswordAction } from '../actions/recover-password.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';

export function RecoverPasswordForm() {
  const [state, action, pending] = useActionState(recoverPasswordAction, undefined);

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingrese su correo institucional para recibir un enlace de recuperación.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Institucional</Label>
            <Input id="email" name="email" type="email" placeholder="usuario@unitru.edu.pe" />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-500'}`}>
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending || state?.success}>
            {pending ? 'Enviando...' : 'Enviar enlace'}
          </Button>
          <div className="text-sm text-center text-gray-500">
            <Link href="/login" className="hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
