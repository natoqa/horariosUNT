'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CalendarDays, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { Periodo } from '@/modules/periodos';
import { Asignacion, GenerationSummary, Horario } from '../../domain/entities/horario.entity';
import { PreValidationResult } from '../../application/use-cases/validate-pre-generation.use-case';
import { UnassignedUnit } from '../../domain/services/schedule-generator.service';
import { GenerationPreCheck } from './generation-pre-check';
import { GenerationProgress } from './generation-progress';
import { GenerationSummaryPanel } from './generation-summary';
import { HorarioGrid } from './horario-grid';
import { AsignacionEditDialog } from './asignacion-edit-dialog';
import { HorarioApprovalPanel } from './horario-approval-panel';
import { validateGenerationAction } from '../actions/validate-generation.action';
import { generateHorarioAction } from '../actions/generate-horario.action';
import { getHorarioAction } from '../actions/get-horario.action';
import { getPlanesEstudioAction } from '@/modules/planes-estudio/presentation/actions/get-planes-estudio.action';
import { PlanEstudio } from '@/modules/planes-estudio/domain/entities/plan-estudio.entity';

type ContentState = 'loading' | 'error' | 'empty' | 'ready' | 'generating' | 'result';

export function HorariosContent() {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<ContentState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [preCheck, setPreCheck] = useState<PreValidationResult | null>(null);
  const [generatingPhase, setGeneratingPhase] = useState(1);
  const [horario, setHorario] = useState<Horario | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [unassigned, setUnassigned] = useState<UnassignedUnit[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [selectedPlanEstudio, setSelectedPlanEstudio] = useState<string>('');

  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);

  // Name maps for the grid
  const [docenteNames, setDocenteNames] = useState<Map<string, string>>(new Map());
  const [cursoNames, setCursoNames] = useState<Map<string, string>>(new Map());
  const [aulaNames, setAulaNames] = useState<Map<string, string>>(new Map());
  const [grupoCiclos, setGrupoCiclos] = useState<Map<string, string>>(new Map());
  const [grupoCursoIds, setGrupoCursoIds] = useState<Map<string, string>>(new Map());

  const loadData = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    const { createClient } = await import('@/shared/lib/supabase/client');
    const supabase = createClient();

    const { data: periodoData, error: periodoError } = await supabase
      .from('periodos')
      .select('*')
      .neq('state', 'Cerrado')
      .limit(1)
      .single();

    if (periodoError || !periodoData) {
      setState('empty');
      setErrorMessage('No hay un período académico activo.');
      return;
    }

    const currentPeriodo: Periodo = {
      id: periodoData.id,
      name: periodoData.name,
      tipoCiclo: periodoData.tipo_ciclo,
      startDate: periodoData.start_date,
      endDate: periodoData.end_date,
      availabilityDeadline: periodoData.availability_deadline,
      state: periodoData.state,
      createdAt: periodoData.created_at,
      updatedAt: periodoData.updated_at,
    };
    setPeriodo(currentPeriodo);

    // Load planes de estudio
    const planesResult = await getPlanesEstudioAction();
    if (planesResult.data) {
      setPlanesEstudio(planesResult.data);
    }

    // Load name maps for the grid display
    const [docentesRes, cursosRes, aulasRes, gruposRes] = await Promise.all([
      supabase.from('docentes').select('id, nombres, apellidos'),
      supabase.from('cursos').select('id, nombre, ciclo'),
      supabase.from('aulas').select('id, nombre, codigo'),
      supabase.from('grupos').select('id, curso_id, nombre'),
    ]);

    const dNames = new Map<string, string>();
    (docentesRes.data ?? []).forEach((d) => dNames.set(d.id, `${d.apellidos}, ${d.nombres}`));
    setDocenteNames(dNames);

    const cNames = new Map<string, string>();
    const cicloMap = new Map<string, string>();
    const cursoIdToCiclo = new Map<string, string>();
    (cursosRes.data ?? []).forEach((c) => {
      cNames.set(c.id, c.nombre);
      cursoIdToCiclo.set(c.id, c.ciclo);
    });

    // Map grupo ID to curso name, ciclo, and cursoId
    const gCursoNames = new Map<string, string>();
    const gCiclos = new Map<string, string>();
    const gCursoIds = new Map<string, string>();
    (gruposRes.data ?? []).forEach((g) => {
      const cursoNombre = cNames.get(g.curso_id);
      gCursoNames.set(g.id, cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre);
      gCursoIds.set(g.id, g.curso_id);
      const ciclo = cursoIdToCiclo.get(g.curso_id);
      if (ciclo) gCiclos.set(g.id, ciclo);
    });
    setCursoNames(gCursoNames);
    setGrupoCiclos(gCiclos);
    setGrupoCursoIds(gCursoIds);

    const aNames = new Map<string, string>();
    (aulasRes.data ?? []).forEach((a) => aNames.set(a.id, `${a.codigo} - ${a.nombre}`));
    setAulaNames(aNames);

    const horarioResult = await getHorarioAction(currentPeriodo.id);
    if (horarioResult.data) {
      setHorario(horarioResult.data.horario);
      setAsignaciones(horarioResult.data.asignaciones);
      setSummary(horarioResult.data.horario.resumen);
      setState('result');
      return;
    }

    // Run pre-validation
    if (currentPeriodo.state === 'Generación') {
      const validationResult = await validateGenerationAction(currentPeriodo.id, false, selectedPlanEstudio || undefined);
      if (validationResult.data) {
        setPreCheck(validationResult.data);
      }
    }

    setState('ready');
  }, [selectedPlanEstudio]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState('error');
      setErrorMessage('Debe iniciar sesión.');
      return;
    }
    loadData();
  }, [user, authLoading, loadData]);

  const handleGenerate = async () => {
    if (!periodo) return;

    setState('generating');
    setGeneratingPhase(1);

    const interval = setInterval(() => {
      setGeneratingPhase((prev) => (prev < 9 ? prev + 1 : prev));
    }, 800);

    const result = await generateHorarioAction(periodo.id, selectedPlanEstudio || undefined);

    clearInterval(interval);
    setGeneratingPhase(9);

    if (result.message) {
      setState('error');
      setErrorMessage(result.message);
      return;
    }

    setAsignaciones(result.asignaciones ?? []);
    setSummary(result.summary ?? null);
    setUnassigned(result.unassigned ?? []);
    setState('result');
  };

  if (authLoading || state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin período activo</p>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  const canGenerate = periodo?.state === 'Generación' && preCheck?.valid === true && (user?.role === 'director' || user?.role === 'secretaria');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Período: {periodo?.name} — Estado: {periodo?.state}
          </p>
        </div>
        {state === 'result' && (periodo?.state === 'Generación' || periodo?.state === 'Publicado') && (
          <Button variant="outline" onClick={handleGenerate}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Regenerar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Plan de Estudios</label>
          <select
            value={selectedPlanEstudio}
            onChange={(e) => setSelectedPlanEstudio(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos los planes</option>
            {planesEstudio.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.nombre} ({plan.anio})
              </option>
            ))}
          </select>
        </div>
      </div>

      {state === 'generating' && (
        <GenerationProgress currentPhase={generatingPhase} />
      )}

      {state === 'ready' && preCheck && (
        <>
          <GenerationPreCheck result={preCheck} />

          <div className="flex justify-end">
            <Button disabled={!canGenerate} onClick={handleGenerate}>
              <Play className="w-4 h-4 mr-1.5" />
              Generar Horario
            </Button>
          </div>
        </>
      )}

      {state === 'ready' && periodo?.state !== 'Generación' && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          El período debe estar en estado &quot;Generación&quot; para ejecutar la generación automática.
          Estado actual: &quot;{periodo?.state}&quot;.
        </div>
      )}

      {state === 'result' && (
        <>
          {summary && (
            <GenerationSummaryPanel summary={summary} unassigned={unassigned} />
          )}

          {horario && (user?.role === 'director' || user?.role === 'secretaria') && (
            <HorarioApprovalPanel
              horarioId={horario.id}
              horarioEstado={horario.estado}
              periodoEstado={periodo?.state ?? 'Configuración'}
              onStateChanged={loadData}
            />
          )}

          <HorarioGrid
            asignaciones={asignaciones}
            docenteNames={docenteNames}
            cursoNames={cursoNames}
            aulaNames={aulaNames}
            grupoCiclos={grupoCiclos}
            grupoCursoIds={grupoCursoIds}
            tipoCiclo={periodo?.tipoCiclo}
            editable={
              (periodo?.state === 'Generación' && horario?.estado === 'Borrador') ||
              (periodo?.state === 'Publicado' && horario?.estado === 'Publicado' && (user?.role === 'director' || user?.role === 'secretaria'))
            }
            onSelectAsignacion={(a) => setEditingAsignacion(a)}
          />

          {editingAsignacion && (
            <AsignacionEditDialog
              asignacion={editingAsignacion}
              docenteName={docenteNames.get(editingAsignacion.docenteId) ?? 'Desconocido'}
              cursoName={cursoNames.get(editingAsignacion.grupoId) ?? 'Curso'}
              aulaName={aulaNames.get(editingAsignacion.aulaId) ?? 'Aula'}
              isPostPublish={horario?.estado === 'Publicado'}
              onClose={() => setEditingAsignacion(null)}
              onSuccess={() => {
                setEditingAsignacion(null);
                loadData();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
