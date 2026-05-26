'use client';

import { useActionState, useEffect } from 'react';
import {
  createPeriodoAction,
  PeriodoActionState,
} from '../actions/create-periodo.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface PeriodoFormProps {
  onSuccess?: () => void;
}

export function PeriodoForm({ onSuccess }: PeriodoFormProps) {
  const [state, formAction, pending] = useActionState<
    PeriodoActionState | undefined,
    FormData
  >(createPeriodoAction, undefined);

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
            Nombre del Periodo
          </Label>
          <Input id="name" name="name" placeholder="Ej: 2026-I" className="h-10" />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tipoCiclo" className="text-xs font-medium text-muted-foreground">
            Tipo de Ciclo
          </Label>
          <select
            id="tipoCiclo"
            name="tipoCiclo"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Impar">Impar (I, III, V, VII, IX)</option>
            <option value="Par">Par (II, IV, VI, VIII, X)</option>
          </select>
          {state?.errors?.tipoCiclo && (
            <p className="text-xs text-destructive">{state.errors.tipoCiclo[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs font-medium text-muted-foreground">
            Fecha de Inicio
          </Label>
          <Input id="startDate" name="startDate" type="date" className="h-10" />
          {state?.errors?.startDate && (
            <p className="text-xs text-destructive">{state.errors.startDate[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-xs font-medium text-muted-foreground">
            Fecha de Fin
          </Label>
          <Input id="endDate" name="endDate" type="date" className="h-10" />
          {state?.errors?.endDate && (
            <p className="text-xs text-destructive">{state.errors.endDate[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availabilityDeadline" className="text-xs font-medium text-muted-foreground">
            Limite Disponibilidad
          </Label>
          <Input id="availabilityDeadline" name="availabilityDeadline" type="date" className="h-10" />
          {state?.errors?.availabilityDeadline && (
            <p className="text-xs text-destructive">{state.errors.availabilityDeadline[0]}</p>
          )}
        </div>
      </div>

      {state?.message && !state?.success && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <p className="text-sm text-emerald-700">{state.message}</p>
        </div>
      )}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Creando...' : 'Crear Periodo'}
      </Button>
    </form>
  );
}
