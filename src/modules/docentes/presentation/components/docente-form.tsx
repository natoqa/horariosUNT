'use client';

import { useActionState, useEffect } from 'react';
import {
  createDocenteAction,
  DocenteActionState,
} from '../actions/create-docente.action';
import { getCargaMaximaDefault } from '../../domain/entities/docente.entity';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AlertTriangle, LinkIcon } from 'lucide-react';
import {
  CATEGORIAS_DOCENTE,
  REGIMENES_DOCENTE,
  CONDICIONES_DOCENTE,
  ESCUELAS_PROCEDENCIA,
  RegimenDocente,
} from '@/shared/constants/categories';
import { useState, useRef } from 'react';

interface DocenteFormProps {
  onSuccess?: () => void;
}

export function DocenteForm({ onSuccess }: DocenteFormProps) {
  const [state, formAction, pending] = useActionState<
    DocenteActionState | undefined,
    FormData
  >(createDocenteAction, undefined);

  const [regimen, setRegimen] = useState<string>('');
  const [cargaMaxima, setCargaMaxima] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setRegimen('');
      setCargaMaxima('');
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const handleRegimenChange = (value: string) => {
    setRegimen(value);
    if (value) {
      setCargaMaxima(String(getCargaMaximaDefault(value as RegimenDocente)));
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Nombres</Label>
          <Input name="nombres" placeholder="Ej: Juan Carlos" className="h-10" />
          {state?.errors?.nombres && (
            <p className="text-xs text-destructive">{state.errors.nombres[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Apellidos</Label>
          <Input name="apellidos" placeholder="Ej: Pérez Rojas" className="h-10" />
          {state?.errors?.apellidos && (
            <p className="text-xs text-destructive">{state.errors.apellidos[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
          <Input name="dni" placeholder="12345678" maxLength={8} className="h-10" />
          {state?.errors?.dni && (
            <p className="text-xs text-destructive">{state.errors.dni[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Correo Institucional</Label>
          <Input name="correo" type="email" placeholder="docente@unitru.edu.pe" className="h-10" />
          {state?.errors?.correo && (
            <p className="text-xs text-destructive">{state.errors.correo[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Teléfono</Label>
          <Input name="telefono" placeholder="987654321" className="h-10" />
          {state?.errors?.telefono && (
            <p className="text-xs text-destructive">{state.errors.telefono[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Fecha de Ingreso</Label>
          <Input name="fechaIngreso" type="date" className="h-10" />
          {state?.errors?.fechaIngreso && (
            <p className="text-xs text-destructive">{state.errors.fechaIngreso[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Categoría</Label>
          <select
            name="categoria"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar...</option>
            {CATEGORIAS_DOCENTE.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {state?.errors?.categoria && (
            <p className="text-xs text-destructive">{state.errors.categoria[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Régimen</Label>
          <select
            name="regimen"
            value={regimen}
            onChange={(e) => handleRegimenChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>Seleccionar...</option>
            {REGIMENES_DOCENTE.map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
          {state?.errors?.regimen && (
            <p className="text-xs text-destructive">{state.errors.regimen[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Condición</Label>
          <select
            name="condicion"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar...</option>
            {CONDICIONES_DOCENTE.map((cond) => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
          {state?.errors?.condicion && (
            <p className="text-xs text-destructive">{state.errors.condicion[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Escuela de Procedencia</Label>
          <select
            name="escuela"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar...</option>
            {ESCUELAS_PROCEDENCIA.map((esc) => (
              <option key={esc} value={esc}>{esc}</option>
            ))}
          </select>
          {state?.errors?.escuela && (
            <p className="text-xs text-destructive">{state.errors.escuela[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Carga Máxima (hrs)</Label>
          <Input
            name="cargaMaxima"
            type="number"
            value={cargaMaxima}
            onChange={(e) => setCargaMaxima(e.target.value)}
            placeholder="40"
            className="h-10"
          />
          {state?.errors?.cargaMaxima && (
            <p className="text-xs text-destructive">{state.errors.cargaMaxima[0]}</p>
          )}
        </div>
      </div>

      {state?.message && !state?.success && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}
      {state?.success && state.authLinked === true && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 space-y-1">
          <div className="flex items-start gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">{state.message}</p>
          </div>
        </div>
      )}
      {state?.success && state.authLinked === false && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">{state.message}</p>
        </div>
      )}
      {state?.success && state.authLinked === undefined && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <p className="text-sm text-emerald-700">{state.message}</p>
        </div>
      )}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Registrando...' : 'Registrar Docente'}
      </Button>
    </form>
  );
}
