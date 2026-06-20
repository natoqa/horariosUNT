'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { createCursoAction, CursoActionState } from '../actions/create-curso.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getPlanesEstudioAction } from '@/modules/planes-estudio/presentation/actions/get-planes-estudio.action';
import { PlanEstudio } from '@/modules/planes-estudio/domain/entities/plan-estudio.entity';

interface CursoFormProps {
  onSuccess?: () => void;
}

export function CursoForm({ onSuccess }: CursoFormProps) {
  const [state, formAction, pending] = useActionState<CursoActionState | undefined, FormData>(
    createCursoAction,
    undefined,
  );

  const [requiereLab, setRequiereLab] = useState(false);
  const [tipoCurso, setTipoCurso] = useState('');
  const [horasTeoricas, setHorasTeoricas] = useState('');
  const [horasPracticas, setHorasPracticas] = useState('');
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      const timer = setTimeout(() => {
        setRequiereLab(false);
        setTipoCurso('');
        setHorasTeoricas('');
        setHorasPracticas('');
      }, 0);
      onSuccess?.();
      return () => clearTimeout(timer);
    }
  }, [state, onSuccess]);

  useEffect(() => {
    const loadPlanesEstudio = async () => {
      const result = await getPlanesEstudioAction();
      if (result.data) {
        setPlanesEstudio(result.data);
      }
    };
    loadPlanesEstudio();
  }, []);

  const handleTipoChange = (value: string) => {
    setTipoCurso(value);
    if (value === 'Teórico') {
      setHorasTeoricas('4');
      setHorasPracticas('0');
    } else if (value === 'Práctico') {
      setHorasTeoricas('0');
      setHorasPracticas('4');
    } else if (value === 'Teórico-Práctico') {
      setHorasTeoricas('2');
      setHorasPracticas('2');
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Código del Curso</Label>
          <Input
            name="codigo"
            placeholder="Ej: SIS-401"
            className="h-10 uppercase"
            maxLength={10}
          />
          {state?.errors?.codigo && (
            <p className="text-xs text-destructive">{state.errors.codigo[0]}</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Nombre del Curso</Label>
          <Input
            name="nombre"
            placeholder="Ej: Desarrollo de Sistemas Web"
            className="h-10"
          />
          {state?.errors?.nombre && (
            <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Plan de Estudios</Label>
        <select
          name="planEstudioId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          defaultValue=""
        >
          <option value="" disabled>Seleccionar...</option>
          {planesEstudio.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.nombre} ({plan.anio})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground">Seleccione el plan de estudios al que pertenece este curso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Ciclo</Label>
          <select
            name="ciclo"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar...</option>
            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((c) => (
              <option key={c} value={c}>Ciclo {c}</option>
            ))}
          </select>
          {state?.errors?.ciclo && (
            <p className="text-xs text-destructive">{state.errors.ciclo[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Tipo de Curso</Label>
          <select
            name="tipo"
            value={tipoCurso}
            onChange={(e) => handleTipoChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>Seleccionar...</option>
            {['Teórico', 'Práctico', 'Teórico-Práctico'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {state?.errors?.tipo && (
            <p className="text-xs text-destructive">{state.errors.tipo[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Horas Teóricas</Label>
          <Input
            name="horasTeoricas"
            type="number"
            value={horasTeoricas}
            onChange={(e) => setHorasTeoricas(e.target.value)}
            placeholder="0"
            className="h-10"
            min={0}
          />
          {state?.errors?.horasTeoricas && (
            <p className="text-xs text-destructive">{state.errors.horasTeoricas[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Horas Prácticas</Label>
          <Input
            name="horasPracticas"
            type="number"
            value={horasPracticas}
            onChange={(e) => setHorasPracticas(e.target.value)}
            placeholder="0"
            className="h-10"
            min={0}
          />
          {state?.errors?.horasPracticas && (
            <p className="text-xs text-destructive">{state.errors.horasPracticas[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Créditos</Label>
          <Input
            name="creditos"
            type="number"
            placeholder="4"
            className="h-10"
            min={1}
            max={10}
          />
          {state?.errors?.creditos && (
            <p className="text-xs text-destructive">{state.errors.creditos[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">¿Requiere Laboratorio?</Label>
          <select
            name="requiereLaboratorio"
            value={String(requiereLab)}
            onChange={(e) => setRequiereLab(e.target.value === 'true')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
          {state?.errors?.requiereLaboratorio && (
            <p className="text-xs text-destructive">{state.errors.requiereLaboratorio[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Tipo de Laboratorio</Label>
          <Input
            name="tipoLaboratorio"
            disabled={!requiereLab}
            placeholder={requiereLab ? "Ej: Lab de Redes y Conectividad" : "No aplica"}
            className="h-10"
          />
          {state?.errors?.tipoLaboratorio && (
            <p className="text-xs text-destructive">{state.errors.tipoLaboratorio[0]}</p>
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
        {pending ? 'Registrando...' : 'Registrar Curso'}
      </Button>
    </form>
  );
}
