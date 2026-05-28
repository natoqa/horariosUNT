'use client'

import { useActionState, useState } from 'react';
import { loginAction } from '../actions/login.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[380px] space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Bienvenido
        </h1>
        <p className="text-sm text-gray-500">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contrasena
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="text-xs text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
        </div>

        {state?.message && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-11 font-medium" disabled={pending}>
          {pending ? 'Iniciando sesion...' : 'Iniciar Sesion'}
        </Button>

        <div className="text-center">
          <Link
            href="/recuperar"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Olvidaste tu contrasena?
          </Link>
        </div>
      </form>

      <div className="pt-4 border-t">
        <p className="text-xs text-center text-gray-400">
          Sistema exclusivo para personal autorizado de la<br />
          Escuela de Ingenieria de Sistemas — UNT
        </p>
      </div>
    </div>
  );
}
