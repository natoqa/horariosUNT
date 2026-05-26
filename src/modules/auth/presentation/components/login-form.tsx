'use client'

import { useActionState } from 'react';
import { loginAction } from '../actions/login.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingrese sus credenciales para acceder al sistema.
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
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" />
            {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Iniciando...' : 'Entrar'}
          </Button>
          <div className="text-sm text-center text-gray-500">
            <Link href="/recuperar" className="hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
