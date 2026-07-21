'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Clock, Check, AlertCircle, Info, Shuffle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { getCargaMaximaDefault } from '@/modules/docentes';
import { Periodo } from '@/modules/periodos';
import { RegimenDocente } from '@/shared/constants/categories';
import { DiaSemana, BloqueHorario, DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { DisponibilidadEstado } from '../../domain/entities/disponibilidad.entity';
import { DisponibilidadGrid, makeKey, getNextEstado } from './disponibilidad-grid';
import { DisponibilidadSummary } from './disponibilidad-summary';
import { getActivePeriodoAction } from '../actions/get-periodo-estado.action';
import { getDisponibilidadAction } from '../actions/get-disponibilidad.action';
import { saveDisponibilidadAction } from '../actions/save-disponibilidad.action';

type ContentState = 'loading' | 'error' | 'empty' | 'success';

export function DisponibilidadContent() {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<ContentState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [docenteRegimen, setDocenteRegimen] = useState<RegimenDocente | null>(null);
  const [docenteCargaMaxima, setDocenteCargaMaxima] = useState<number | null>(null);
  const [gridState, setGridState] = useState<Map<string, DisponibilidadEstado>>(new Map());
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEditable = periodo?.state === 'Recopilación';

  const availableCount = Array.from(gridState.values()).filter((e) => e === 'disponible').length;
  const preferredCount = Array.from(gridState.values()).filter((e) => e === 'preferido').length;
  const minRequired = docenteCargaMaxima ?? (docenteRegimen ? getCargaMaximaDefault(docenteRegimen) : 0);
  const totalAvailable = availableCount + preferredCount;
  const canSave = isEditable && totalAvailable >= minRequired && !saving;

  const loadData = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    const periodoResult = await getActivePeriodoAction();

    if (periodoResult.message || !periodoResult.data) {
      setState('empty');
      setErrorMessage(periodoResult.message || 'No hay un período académico activo.');
      return;
    }

    setPeriodo(periodoResult.data);

    const disponibilidadResult = await getDisponibilidadAction(periodoResult.data.id);

    if (disponibilidadResult.message) {
      setState('error');
      setErrorMessage(disponibilidadResult.message);
      return;
    }

    if (disponibilidadResult.docenteCargaMaxima) {
      setDocenteCargaMaxima(disponibilidadResult.docenteCargaMaxima);
    }

    const newGrid = new Map<string, DisponibilidadEstado>();
    if (disponibilidadResult.data) {
      for (const d of disponibilidadResult.data) {
        newGrid.set(makeKey(d.dia, d.bloque), d.estado);
      }
    }
    setGridState(newGrid);
    setState('success');
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setState('error');
      setErrorMessage('Debe iniciar sesión para acceder.');
      return;
    }

    const regimen = (user as unknown as { regimen?: string }).regimen;
    if (regimen) {
      setDocenteRegimen(regimen as RegimenDocente);
    }

    loadData();
  }, [user, authLoading, loadData]);

  useEffect(() => {
    if (!docenteRegimen && user && periodo) {
      setDocenteRegimen('Tiempo Completo');
    }
  }, [docenteRegimen, user, periodo]);

  const handleToggle = (dia: DiaSemana, bloque: BloqueHorario) => {
    const key = makeKey(dia, bloque);
    const current = gridState.get(key) ?? 'no_disponible';
    const next = getNextEstado(current);
    const newGrid = new Map(gridState);
    if (next === 'no_disponible') {
      newGrid.delete(key);
    } else {
      newGrid.set(key, next);
    }
    setGridState(newGrid);
    setSuccessMsg(null);
  };

  const handleAutoFill = () => {
    const minRequired = docenteCargaMaxima ?? (docenteRegimen ? getCargaMaximaDefault(docenteRegimen) : 0);
    if (minRequired === 0) return;

    const newGrid = new Map<string, DisponibilidadEstado>();

    // Get all possible blocks
    const allBlocks: { dia: DiaSemana; bloque: BloqueHorario }[] = [];
    for (const dia of DIAS_SEMANA) {
      for (const bloque of BLOQUES_HORARIOS) {
        allBlocks.push({ dia, bloque });
      }
    }

    // Shuffle blocks randomly
    const shuffled = [...allBlocks].sort(() => Math.random() - 0.5);

    // Assign minRequired blocks as available
    for (let i = 0; i < minRequired && i < shuffled.length; i++) {
      const { dia, bloque } = shuffled[i];
      const key = makeKey(dia, bloque);
      // Randomly choose between 'disponible' and 'preferido'
      const estado = Math.random() > 0.7 ? 'preferido' : 'disponible';
      newGrid.set(key, estado);
    }

    setGridState(newGrid);
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    if (!periodo || !docenteRegimen) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMsg(null);

    const blocks = Array.from(gridState.entries()).map(([key, estado]) => {
      const [dia, bloque] = key.split('||');
      return {
        dia: dia as DiaSemana,
        bloque: bloque as BloqueHorario,
        estado,
      };
    });

    const result = await saveDisponibilidadAction(periodo.id, blocks, docenteRegimen, docenteCargaMaxima ?? undefined);

    if (result.success) {
      setSuccessMsg(result.message || 'Disponibilidad registrada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMessage(result.message || 'Error al guardar.');
    }

    setSaving(false);
  };

  if (authLoading || state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando disponibilidad...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <Clock className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin período activo</p>
        <p className="text-xs text-muted-foreground">
          {errorMessage || 'No hay un período académico activo en este momento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disponibilidad Horaria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Período: {periodo?.name} — Estado: {periodo?.state}
          </p>
        </div>
      </div>

      {!isEditable && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-600">
            El período no está en estado &quot;Recopilación&quot;. La grilla es de solo lectura.
          </p>
        </div>
      )}

      {docenteRegimen && (
        <DisponibilidadSummary
          availableCount={availableCount}
          preferredCount={preferredCount}
          minRequired={minRequired}
          regimen={docenteRegimen}
        />
      )}

      {isEditable && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={!docenteCargaMaxima && !docenteRegimen}
          >
            <Shuffle className="w-4 h-4 mr-1.5" />
            Autocompletar Aleatoriamente
          </Button>
        </div>
      )}

      <DisponibilidadGrid
        gridState={gridState}
        onToggle={handleToggle}
        disabled={!isEditable}
      />

      {errorMessage && state === 'success' && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {successMsg && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>
        </div>
      )}

      {isEditable && (
        <div className="flex justify-end">
          <Button
            disabled={!canSave}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Guardar Disponibilidad
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
