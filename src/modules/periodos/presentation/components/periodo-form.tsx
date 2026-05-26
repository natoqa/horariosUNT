'use client';

import { useActionState, useEffect } from 'react';
import {
  createPeriodoAction,
  PeriodoActionState,
} from '../actions/create-periodo.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Período Académico</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Período</Label>
            <Input id="name" name="name" placeholder="Ej: 2026-I" />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input id="startDate" name="startDate" type="date" />
              {state?.errors?.startDate && (
                <p className="text-sm text-red-500">
                  {state.errors.startDate[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input id="endDate" name="endDate" type="date" />
              {state?.errors?.endDate && (
                <p className="text-sm text-red-500">
                  {state.errors.endDate[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityDeadline">
                Fecha Límite Disponibilidad
              </Label>
              <Input
                id="availabilityDeadline"
                name="availabilityDeadline"
                type="date"
              />
              {state?.errors?.availabilityDeadline && (
                <p className="text-sm text-red-500">
                  {state.errors.availabilityDeadline[0]}
                </p>
              )}
            </div>
          </div>
          {state?.message && !state?.success && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 font-medium">
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creando...' : 'Crear Período'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
