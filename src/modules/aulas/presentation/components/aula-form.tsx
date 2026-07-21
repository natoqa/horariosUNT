'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createAulaAction, AulaActionState } from '../actions/create-aula.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface AulaFormProps {
  onSuccess?: () => void;
}

export function AulaForm({ onSuccess }: AulaFormProps) {
  const [state, formAction, pending] = useActionState<AulaActionState | undefined, FormData>(
    createAulaAction,
    undefined,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Código de Aula</Label>
          <Input
            name="codigo"
            placeholder="Ej: A-101"
            className="h-10 uppercase"
            maxLength={10}
          />
          {state?.errors?.codigo && (
            <p className="text-xs text-destructive">{state.errors.codigo[0]}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Nombre de Aula / Laboratorio</Label>
          <Input
            name="nombre"
            placeholder="Ej: Aula 101 - Primer Piso"
            className="h-10"
          />
          {state?.errors?.nombre && (
            <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Pabellón</Label>
          <Input
            name="pabellon"
            placeholder="Ej: Pabellón A"
            className="h-10"
          />
          {state?.errors?.pabellon && (
            <p className="text-xs text-destructive">{state.errors.pabellon[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Piso</Label>
          <Input
            name="piso"
            type="number"
            placeholder="1"
            className="h-10"
            min={0}
            max={10}
          />
          {state?.errors?.piso && (
            <p className="text-xs text-destructive">{state.errors.piso[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Capacidad (Estudiantes)</Label>
          <Input
            name="capacidad"
            type="number"
            placeholder="40"
            className="h-10"
            min={1}
            max={500}
          />
          {state?.errors?.capacidad && (
            <p className="text-xs text-destructive">{state.errors.capacidad[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Tipo de Espacio</Label>
          <select
            name="tipo"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar...</option>
            {['Aula Teórica', 'Laboratorio de Cómputo', 'Laboratorio Especializado', 'Auditorio'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {state?.errors?.tipo && (
            <p className="text-xs text-destructive">{state.errors.tipo[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Equipamiento (Separado por comas)</Label>
        <Input
          name="equipamiento"
          placeholder="Ej: Proyector Multimedia, Ecran, Pizarra Acrílica, Aire Acondicionado"
          className="h-10"
        />
        <p className="text-[10px] text-muted-foreground">
          Escribe los equipos que posee el espacio separados por una coma (,).
        </p>
        {state?.errors?.equipamiento && (
          <p className="text-xs text-destructive">{state.errors.equipamiento[0]}</p>
        )}
      </div>

      {state?.message && !state?.success && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
          <p className="text-sm text-emerald-600">{state.message}</p>
        </div>
      )}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Registrando...' : 'Registrar Aula'}
      </Button>
    </form>
  );
}
