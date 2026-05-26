'use client'

import { useActionState } from 'react';
import { recoverPasswordAction } from '../actions/recover-password.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export function RecoverPasswordForm() {
  const [state, action, pending] = useActionState(recoverPasswordAction, undefined);

  return (
    <div className="w-full max-w-[380px] space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Recuperar Contrasena
        </h1>
        <p className="text-sm text-gray-500">
          Ingresa tu correo institucional para recibir un enlace de recuperacion
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Correo Institucional
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@unitru.edu.pe"
              className="pl-10 h-11"
            />
          </div>
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        {state?.message && !state?.success && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        {state?.success && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-sm text-emerald-700">{state.message}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-11 font-medium" disabled={pending || state?.success}>
          {pending ? 'Enviando...' : 'Enviar enlace de recuperacion'}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesion
          </Link>
        </div>
      </form>
    </div>
  );
}
