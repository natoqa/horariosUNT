'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CalendarDays, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Asignacion, ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';
import { getDocenteHorarioAction } from '../actions/get-docente-horario.action';
import { generateDocentePdfAction } from '../actions/generate-docente-pdf.action';

type ViewState = 'loading' | 'error' | 'empty' | 'success';

const CICLO_COLORS: Record<string, string> = {
  I: 'bg-blue-50 border-blue-200 text-blue-800',
  II: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  III: 'bg-amber-50 border-amber-200 text-amber-800',
  IV: 'bg-purple-50 border-purple-200 text-purple-800',
  V: 'bg-rose-50 border-rose-200 text-rose-800',
  VI: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  VII: 'bg-orange-50 border-orange-200 text-orange-800',
  VIII: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  IX: 'bg-teal-50 border-teal-200 text-teal-800',
  X: 'bg-pink-50 border-pink-200 text-pink-800',
};

export function DocenteHorarioView() {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [periodoName, setPeriodoName] = useState('');
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [cursoNames, setCursoNames] = useState<Record<string, string>>({});
  const [aulaNames, setAulaNames] = useState<Record<string, string>>({});
  const [grupoCiclos, setGrupoCiclos] = useState<Record<string, string>>({});
  const [actividadesNoLectivas, setActividadesNoLectivas] = useState<Array<{
    id: string;
    tipo: string;
    horas: number;
    detalles: string;
    dia?: string;
    bloque?: string;
  }>>([]);
  const [horarioEstado, setHorarioEstado] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadData = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    const result = await getDocenteHorarioAction();

    if (result.debug) {
      console.log('[DocenteHorario Debug]', result.debug);
    }

    if (result.message || !result.data) {
      if (result.message?.includes('No hay') || result.message?.includes('No tienes')) {
        setState('empty');
      } else {
        setState('error');
      }
      setErrorMessage(result.message ?? 'Error al cargar horario.');
      return;
    }

    setPeriodoName(result.data.periodoName);
    setAsignaciones(result.data.asignaciones);
    setCursoNames(result.data.cursoNames);
    setAulaNames(result.data.aulaNames);
    setGrupoCiclos(result.data.grupoCiclos);
    setActividadesNoLectivas(result.data.actividadesNoLectivas);

    if (result.data.asignaciones.length === 0) {
      setState('empty');
      setErrorMessage('No tienes asignaciones en el horario actual.');
      return;
    }

    setState('success');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState('error');
      setErrorMessage('Debe iniciar sesión.');
      return;
    }
    loadData();
  }, [user, authLoading, loadData]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    const result = await generateDocentePdfAction();

    if (result.pdfBase64 && result.fileName) {
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      setErrorMessage(result.message ?? 'Error al generar PDF.');
    }
    setDownloadingPdf(false);
  };

  // Filter assignments by selected day
  const filtered = selectedDay
    ? asignaciones.filter((a) => a.dia === selectedDay)
    : asignaciones;

  // Build assignment map for the grid
  const assignmentMap = new Map<string, Asignacion[]>();
  for (const a of filtered) {
    const key = `${a.dia}||${a.bloque}`;
    const existing = assignmentMap.get(key) ?? [];
    existing.push(a);
    assignmentMap.set(key, existing);
  }

  // Build actividad map for the grid
  const actividadMap = new Map<string, Array<{
    id: string;
    tipo: string;
    horas: number;
    detalles: string;
    dia?: string;
    bloque?: string;
  }>>();
  for (const act of actividadesNoLectivas) {
    if (act.dia && act.bloque) {
      const key = `${act.dia}||${act.bloque}`;
      const existing = actividadMap.get(key) ?? [];
      existing.push(act);
      actividadMap.set(key, existing);
    }
  }

  // Determine which days to show in the grid
  const daysToShow = selectedDay
    ? DIAS_SEMANA.filter((d) => d === selectedDay)
    : DIAS_SEMANA;

  // Calculate stats
  const totalSesiones = asignaciones.length;
  const cursosUnicos = new Set(asignaciones.map((a) => a.grupoId)).size;

  // Check for pending assignments (assignments without dia/bloque)
  const pendingAssignments = asignaciones.filter((a) => !a.dia || !a.bloque);
  const hasPendingAssignments = pendingAssignments.length > 0;

  // Show pending assignments list if no horario or if there are pending assignments
  if (horarioEstado === 'Pendiente' || hasPendingAssignments) {
    return (
      <div className="space-y-6">
        {/* Info bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Período: <span className="font-semibold text-foreground">{periodoName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cursosUnicos} curso{cursosUnicos !== 1 ? 's' : ''} · {totalSesiones} asignacion{totalSesiones !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Pending assignments */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {horarioEstado === 'Pendiente' ? 'Horario no generado' : 'Asignaciones pendientes de horario'}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {horarioEstado === 'Pendiente'
              ? 'El horario aún no ha sido generado. Tus asignaciones manuales se muestran a continuación:'
              : 'Las siguientes asignaciones aún no tienen horario asignado:'}
          </p>
          <div className="space-y-3">
            {pendingAssignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{cursoNames[a.grupoId] || 'Curso'}</p>
                  <p className="text-xs text-muted-foreground">Sin horario asignado</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Pendiente
                </span>
              </div>
            ))}
            {pendingAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay asignaciones pendientes
              </p>
            )}
          </div>
        </div>

        {/* Actividades no lectivas */}
        {actividadesNoLectivas.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Actividades No Lectivas
            </h3>
            <div className="space-y-3">
              {actividadesNoLectivas.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div>
                    <p className="text-sm font-medium text-orange-900">{act.tipo}</p>
                    <p className="text-xs text-orange-700">{act.detalles}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                    {act.horas}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (authLoading || state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando tu horario...</p>
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

  return (
    <div className="space-y-6">
      {/* Info bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Período: <span className="font-semibold text-foreground">{periodoName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cursosUnicos} curso{cursosUnicos !== 1 ? 's' : ''} · {totalSesiones} sesion{totalSesiones !== 1 ? 'es' : ''} / semana
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-1.5" />
          )}
          Descargar PDF
        </Button>
      </div>

      {/* Day filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Filtrar por día:</span>
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedDay === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Todos
        </button>
        {DIAS_SEMANA.map((dia) => (
          <button
            key={dia}
            onClick={() => setSelectedDay(dia)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedDay === dia
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {dia}
          </button>
        ))}
      </div>

      {/* Schedule grid */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="p-2 border-r border-border font-semibold text-muted-foreground w-24 text-center">
                  Horario
                </th>
                {daysToShow.map((dia) => (
                  <th key={dia} className="p-2 border-r border-border font-bold text-foreground text-center last:border-r-0">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BLOQUES_HORARIOS.map((bloque) => (
                <tr key={bloque}>
                  <td className="p-2 border-r border-border font-semibold text-muted-foreground text-center bg-muted/10 font-mono">
                    {bloque}
                  </td>
                  {daysToShow.map((dia) => {
                    const key = `${dia}||${bloque}`;
                    const cellAssignments = assignmentMap.get(key) ?? [];
                    const cellActividades = actividadMap.get(key) ?? [];

                    return (
                      <td key={dia} className="p-1 border-r border-border align-top last:border-r-0">
                        {(cellAssignments.length > 0 || cellActividades.length > 0) ? (
                          <div className="space-y-1">
                            {cellAssignments.map((a) => {
                              const ciclo = grupoCiclos[a.grupoId] ?? '';
                              const colorClass = CICLO_COLORS[ciclo] ?? 'bg-muted border-border text-foreground';

                              return (
                                <div
                                  key={a.id}
                                  className={`rounded border px-1.5 py-1 ${colorClass}`}
                                >
                                  <p className="font-semibold text-[10px] leading-tight truncate">
                                    {cursoNames[a.grupoId] ?? 'Curso'}
                                  </p>
                                  <p className="text-[9px] leading-tight truncate opacity-80">
                                    {aulaNames[a.aulaId] ?? 'Aula'} · {ASIGNACION_TIPO_LABELS[a.tipo]}
                                  </p>
                                </div>
                              );
                            })}
                            {cellActividades.map((act) => (
                              <div
                                key={act.id}
                                className="rounded border px-1.5 py-1 bg-orange-50 border-orange-200 text-orange-800"
                              >
                                <p className="font-semibold text-[10px] leading-tight truncate">
                                  {act.tipo}
                                </p>
                                <p className="text-[9px] leading-tight truncate opacity-80">
                                  {act.horas}h · No lectiva
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-12" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
