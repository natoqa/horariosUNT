'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { Periodo, CICLOS_IMPAR, CICLOS_PAR } from '@/modules/periodos';
import { Asignacion, Horario } from '../../domain/entities/horario.entity';
import { DragDropHorarioGrid } from './drag-drop-horario-grid';
import { getHorarioAction } from '../actions/get-horario.action';
import { getDocenteHorarioAction } from '../actions/get-docente-horario.action';
import { updateAsignacionAction } from '../actions/update-asignacion.action';
import { checkAulaAvailabilityAction } from '../actions/check-aula-availability.action';
import { ActividadNoLectiva } from '@/modules/carga-no-lectiva/domain/entities/carga-no-lectiva.entity';
import { SupabaseCargaNoLectivaRepository } from '@/modules/carga-no-lectiva/infrastructure/supabase-carga-no-lectiva.repository';

type ViewMode = 'lectivas' | 'no-lectivas';

interface UnifiedAsignacion {
  id: string;
  horarioId?: string;
  grupoId: string;
  docenteId: string;
  aulaId?: string;
  dia: Asignacion['dia'];
  bloque: Asignacion['bloque'];
  tipo: 'teorico' | 'practico' | 'nolectiva';
  createdAt: string;
  actividadNoLectiva?: ActividadNoLectiva;
}

export function HorarioGraficoContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const docenteIdFromUrl = searchParams.get('docenteId');
  const viewModeFromUrl = searchParams.get('viewMode') as ViewMode | null;
  
  const [viewMode, setViewMode] = useState<ViewMode>(viewModeFromUrl || 'lectivas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [horario, setHorario] = useState<Horario | null>(null);
  const [asignaciones, setAsignaciones] = useState<UnifiedAsignacion[]>([]);

  // Name maps for the grid
  const [docenteNames, setDocenteNames] = useState<Map<string, string>>(new Map());
  const [cursoNames, setCursoNames] = useState<Map<string, string>>(new Map());
  const [aulaNames, setAulaNames] = useState<Map<string, string>>(new Map());
  const [grupoCiclos, setGrupoCiclos] = useState<Map<string, string>>(new Map());
  const [grupoCursoIds, setGrupoCursoIds] = useState<Map<string, string>>(new Map());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { createClient } = await import('@/shared/lib/supabase/client');
      const supabase = createClient();

      const { data: periodoData, error: periodoError } = await supabase
        .from('periodos')
        .select('*')
        .neq('state', 'Cerrado')
        .limit(1)
        .single();

      if (periodoError || !periodoData) {
        setError('No hay un período académico activo.');
        setLoading(false);
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

      let unifiedAsignaciones: UnifiedAsignacion[] = [];
      let cursoNamesMap = new Map<string, string>();
      let aulaNamesMap = new Map<string, string>();
      let grupoCiclosMap = new Map<string, string>();
      let grupoCursoIdsMap = new Map<string, string>();

      // Use different data loading logic based on role and docenteId
      if (docenteIdFromUrl || user?.role === 'docente') {
        // Use getDocenteHorarioAction for viewing specific docente's schedule (loads both lective and non-lective activities)
        const docenteHorarioResult = await getDocenteHorarioAction(docenteIdFromUrl || undefined);

        if (docenteHorarioResult.data) {
          // Get expected ciclos for current periodo
          const expectedCiclos = currentPeriodo.tipoCiclo === 'Impar' 
            ? CICLOS_IMPAR 
            : CICLOS_PAR;
          
          // Filter lective asignaciones based on periodo tipoCiclo
          const filteredLectiveAsignaciones = docenteHorarioResult.data.asignaciones.filter((a) => {
            const ciclo = docenteHorarioResult.data?.grupoCiclos[a.grupoId];
            if (!ciclo) return false;
            return expectedCiclos.some(c => c === ciclo);
          });
          
          // Convert lective asignaciones to unified format
          unifiedAsignaciones = filteredLectiveAsignaciones.map((a: Asignacion) => ({
            ...a,
            tipo: a.tipo as 'teorico' | 'practico',
          }));

          // Convert non-lective activities to unified format
          // Only include non-lective activities if the docente has courses in the current periodo
          // Check if the docente's current lective assignments match the periodo's tipoCiclo
          const currentAssignmentCiclos = new Set<string>();
          docenteHorarioResult.data.asignaciones.forEach((asignacion) => {
            const ciclo = docenteHorarioResult.data?.grupoCiclos[asignacion.grupoId];
            if (ciclo) {
              currentAssignmentCiclos.add(ciclo);
            }
          });
          
          // Check if docente has current assignments that match the periodo's tipoCiclo
          const hasMatchingCourses = Array.from(currentAssignmentCiclos).some(ciclo => expectedCiclos.some(c => c === ciclo));
          
          const noLectivaAsignaciones: UnifiedAsignacion[] = hasMatchingCourses
            ? docenteHorarioResult.data.actividadesNoLectivas
                .filter((actividad) => actividad.dia && actividad.bloque) // Only include those with assigned time slots
                .map((actividad) => ({
                  id: actividad.id,
                  grupoId: `no-lectiva-${actividad.id}`,
                  docenteId: user?.id || '',
                  aulaId: undefined,
                  dia: actividad.dia as Asignacion['dia'],
                  bloque: actividad.bloque as Asignacion['bloque'],
                  tipo: 'nolectiva' as const,
                  createdAt: new Date().toISOString(),
                  actividadNoLectiva: { ...actividad, tipoPeriodo: currentPeriodo.tipoCiclo } as any,
                }))
            : [];

          console.log('[HorarioGrafico] No lectiva asignaciones con dia/bloque:', noLectivaAsignaciones.length);
          unifiedAsignaciones = [...unifiedAsignaciones, ...noLectivaAsignaciones];

          // Set name maps from docente horario result
          Object.entries(docenteHorarioResult.data.cursoNames).forEach(([id, name]) => {
            cursoNamesMap.set(id, name);
          });
          Object.entries(docenteHorarioResult.data.aulaNames).forEach(([id, name]) => {
            aulaNamesMap.set(id, name);
          });
          Object.entries(docenteHorarioResult.data.grupoCiclos).forEach(([id, ciclo]) => {
            grupoCiclosMap.set(id, ciclo);
          });
        }
      } else {
        // Use getHorarioAction for director and secretaria
        const horarioResult = await getHorarioAction(currentPeriodo.id);
        console.log('[HorarioGrafico] Horario result:', horarioResult);

        if (horarioResult.data) {
          console.log('[HorarioGrafico] Horario:', horarioResult.data.horario);
          console.log('[HorarioGrafico] Asignaciones:', horarioResult.data.asignaciones);
          setHorario(horarioResult.data.horario);

          // Convert lective asignaciones to unified format
          unifiedAsignaciones = horarioResult.data.asignaciones.map((a: Asignacion) => ({
            ...a,
            tipo: a.tipo as 'teorico' | 'practico',
          }));
        } else {
          console.log('[HorarioGrafico] Horario result message:', horarioResult.message);
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

        const gCursoNames = new Map<string, string>();
        const gCiclos = new Map<string, string>();
        const gCursoIds = new Map<string, string>();
        (gruposRes.data ?? []).forEach((g) => {
          const cursoNombre = cNames.get(g.curso_id);
          gCursoNames.set(g.id, cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre);
          const ciclo = cursoIdToCiclo.get(g.curso_id);
          if (ciclo) gCiclos.set(g.id, ciclo);
          gCursoIds.set(g.id, g.curso_id);
        });
        cursoNamesMap = gCursoNames;
        grupoCiclosMap = gCiclos;
        grupoCursoIdsMap = gCursoIds;

        const aNames = new Map<string, string>();
        (aulasRes.data ?? []).forEach((a) => aNames.set(a.id, `${a.codigo} - ${a.nombre}`));
        aulaNamesMap = aNames;
      }

      setCursoNames(cursoNamesMap);
      setAulaNames(aulaNamesMap);
      setGrupoCiclos(grupoCiclosMap);
      setGrupoCursoIds(grupoCursoIdsMap);
      setAsignaciones(unifiedAsignaciones);
      console.log('[HorarioGrafico] Total unified asignaciones:', unifiedAsignaciones.length);
    } catch (err) {
      setError('Error al cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('Debe iniciar sesión.');
      setLoading(false);
      return;
    }
    loadData();
  }, [user, authLoading, loadData]);

  const handleDrop = async (asignacion: Asignacion, newDia: string, newBloque: string) => {
    try {
      // Check if this is a non-lective activity by looking at the original unified asignaciones
      const originalAsignacion = asignaciones.find((a) => a.id === asignacion.id);
      
      if (originalAsignacion?.actividadNoLectiva) {
        // For non-lective activities, update the actividad_no_lectiva record
        const { createClient } = await import('@/shared/lib/supabase/client');
        const supabase = createClient();
        
        const { error } = await supabase
          .from('actividades_no_lectivas')
          .update({ dia: newDia, bloque: newBloque })
          .eq('id', asignacion.id);
        
        if (error) {
          setError('Error al actualizar la actividad no lectiva');
          console.error(error);
          return;
        }
      } else {
        // For lective activities, use the normal update action
        const result = await updateAsignacionAction({
          asignacionId: asignacion.id,
          dia: newDia,
          bloque: newBloque,
        });

        if (!result.success) {
          setError(result.message || 'Error al actualizar la asignación');
          return;
        }
      }

      // Reload data to reflect changes in all views
      await loadData();
      
      // Force a cache refresh to ensure all views are updated
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('horario-updated'));
      }
    } catch (err) {
      console.error(err);
      setError('Error al actualizar la asignación');
    }
  };

  const handleCheckAulaAvailability = async (aulaId: string, dia: string, bloque: string, excludeAsignacionId?: string) => {
    const result = await checkAulaAvailabilityAction(aulaId, dia, bloque, excludeAsignacionId);
    return result.available;
  };

  const filteredAsignaciones = asignaciones.filter((a) => {
    if (viewMode === 'lectivas') {
      return a.tipo === 'teorico' || a.tipo === 'practico';
    } else {
      return a.tipo === 'nolectiva';
    }
  });

  // Convert filtered asignaciones to the format expected by DragDropHorarioGrid
  const gridAsignaciones: Asignacion[] = filteredAsignaciones.map((a) => ({
    id: a.id,
    horarioId: a.horarioId || '',
    grupoId: a.grupoId,
    docenteId: a.docenteId,
    aulaId: a.aulaId || '',
    dia: a.dia,
    bloque: a.bloque,
    tipo: a.tipo === 'nolectiva' ? 'practico' : a.tipo, // Map nolectiva to practico for display
    createdAt: a.createdAt,
    ...(a.actividadNoLectiva && { actividadNoLectiva: a.actividadNoLectiva }), // Preserve actividadNoLectiva
  }));

  console.log('[HorarioGrafico] Total asignaciones:', asignaciones.length);
  console.log('[HorarioGrafico] View mode:', viewMode);
  console.log('[HorarioGrafico] Filtered asignaciones:', filteredAsignaciones.length);
  console.log('[HorarioGrafico] Asignaciones tipos:', asignaciones.map(a => a.tipo));

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Reintentar
        </Button>
      </div>
    );
  }

  const canEdit = user?.role === 'director' || user?.role === 'secretaria' || user?.role === 'docente';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horario Gráfico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Período: {periodo?.name} — Estado: {periodo?.state}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant={viewMode === 'lectivas' ? 'default' : 'outline'}
          onClick={() => setViewMode('lectivas')}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Horario Lectivas
        </Button>
        <Button
          variant={viewMode === 'no-lectivas' ? 'default' : 'outline'}
          onClick={() => setViewMode('no-lectivas')}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Horario No Lectivas
        </Button>
      </div>

      {gridAsignaciones.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">
            No hay actividades {viewMode === 'lectivas' ? 'lectivas' : 'no lectivas'} asignadas
          </p>
          <p className="text-xs text-muted-foreground">
            {viewMode === 'lectivas'
              ? 'Genera el horario para ver las actividades lectivas'
              : 'Registra actividades no lectivas para verlas aquí'}
          </p>
        </div>
      ) : (
        <DragDropHorarioGrid
          asignaciones={gridAsignaciones}
          docenteNames={docenteNames}
          cursoNames={cursoNames}
          aulaNames={aulaNames}
          grupoCiclos={grupoCiclos}
          grupoCursoIds={grupoCursoIds}
          tipoCiclo={periodo?.tipoCiclo}
          isNonLectiva={viewMode === 'no-lectivas'}
          periodoTipoCiclo={periodo?.tipoCiclo}
          userRole={user?.role as 'director' | 'secretaria' | 'docente'}
          onDrop={canEdit ? handleDrop : undefined}
          checkAulaAvailability={viewMode === 'lectivas' ? handleCheckAulaAvailability : undefined}
        />
      )}

      {!canEdit && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Solo el director puede modificar los horarios.
        </div>
      )}
    </div>
  );
}
