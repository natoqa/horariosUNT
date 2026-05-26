'use client'

import { useActionState } from 'react';
import { changePasswordAction } from '../actions/change-password.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Lock } from 'lucide-react';

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);

  return (
    <div className="w-full max-w-[440px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cambiar Contrasena</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa tu contrasena actual y define una nueva
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Contrasena actual
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="currentPassword" type="password" placeholder="••••••••" className="pl-10 h-10" />
          </div>
          {state?.errors?.currentPassword && (
            <p className="text-xs text-destructive">{state.errors.currentPassword[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Nueva contrasena
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="newPassword" type="password" placeholder="••••••••" className="pl-10 h-10" />
          </div>
          {state?.errors?.newPassword && (
            <p className="text-xs text-destructive">{state.errors.newPassword[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Confirmar nueva contrasena
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="confirmPassword" type="password" placeholder="••••••••" className="pl-10 h-10" />
          </div>
          {state?.errors?.confirmPassword && (
            <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
          )}
        </div>

        {state?.message && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        <Button type="submit" disabled={pending} className="h-10">
          {pending ? 'Cambiando...' : 'Cambiar Contrasena'}
        </Button>
      </form>
    </div>
  );
}
