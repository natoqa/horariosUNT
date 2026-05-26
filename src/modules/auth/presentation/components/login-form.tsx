'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';
import { loginSchema } from '../../application/dtos/login.dto';
import type { UserRole } from '@/shared/types';

const DEV_USERS_HINT = [
  { role: 'Director', email: 'director@unitru.edu.pe', password: 'Director123!' },
  { role: 'Secretaria', email: 'secretaria@unitru.edu.pe', password: 'Secretaria123!' },
  { role: 'Docente', email: 'docente@unitru.edu.pe', password: 'Docente123!' },
];

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validatedFields = loginSchema.safeParse({ email, password });
    if (!validatedFields.success) {
      setFieldErrors(validatedFields.error.flatten().fieldErrors);
      setMessage('Revise los campos ingresados.');
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedFields.data.email,
        password: validatedFields.data.password,
      });

      if (error || !data.user) {
        const errorMessage = error?.message ?? 'Credenciales inválidas.';
        if (errorMessage.toLowerCase().includes('invalid api key')) {
          setMessage(
            'La clave de Supabase en .env.local no es válida. Actualízala desde Supabase → Settings → API.',
          );
        } else if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          setMessage(
            'Correo o contraseña incorrectos. Si es la primera vez, ejecuta: npm run seed:users',
          );
        } else {
          setMessage(errorMessage);
        }
        return;
      }

      const userRole = (data.user.user_metadata?.role as UserRole) || 'docente';
      router.push(`/${userRole}`);
      router.refresh();
    } catch {
      setMessage('No se pudo conectar con Supabase. Verifica .env.local y reinicia npm run dev.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-[380px] space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bienvenido</h1>
        <p className="text-sm text-gray-500">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="email"
              />
            </div>
            {fieldErrors?.email && (
              <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
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
                type="password"
                placeholder="••••••••"
                className="pl-10 h-11"
                autoComplete="current-password"
              />
            </div>
            {fieldErrors?.password && (
              <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
            )}
          </div>
        </div>

        {message && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{message}</p>
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

      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground">Usuarios de prueba (después de npm run seed:users)</p>
        <ul className="text-[11px] text-muted-foreground space-y-1.5">
          {DEV_USERS_HINT.map((u) => (
            <li key={u.email}>
              <span className="font-medium text-foreground">{u.role}:</span> {u.email} / {u.password}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-center text-gray-400">
          Sistema exclusivo para personal autorizado de la
          <br />
          Escuela de Ingenieria de Sistemas — UNT
        </p>
      </div>
    </div>
  );
}
