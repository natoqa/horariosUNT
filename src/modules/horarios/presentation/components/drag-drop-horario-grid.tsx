'use client';

import { useState, useMemo } from 'react';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Asignacion, ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';
import { type TipoCiclo, getCiclosByTipo } from '@/modules/periodos';

interface DragDropHorarioGridProps {
  asignaciones: Asignacion[];
  docenteNames: Map<string, string>;
  cursoNames: Map<string, string>;
  aulaNames: Map<string, string>;
  grupoCiclos: Map<string, string>;
  grupoCursoIds: Map<string, string>;
  isNonLectiva?: boolean;
  isAulaView?: boolean;
  periodoTipoCiclo?: TipoCiclo;
  userRole?: 'director' | 'secretaria' | 'docente';
  onDrop?: (asignacion: Asignacion, newDia: string, newBloque: string) => Promise<void>;
  checkAulaAvailability?: (aulaId: string, dia: string, bloque: string, excludeAsignacionId?: string) => Promise<boolean>;
  aulaConflicts?: Map<string, { curso: string; docente: string; grupo: string }>;
}

const CURSO_PALETTE = [
  'bg-blue-500/10 border-blue-500/20 text-blue-600',
  'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
  'bg-amber-500/10 border-amber-500/20 text-amber-600',
  'bg-purple-500/10 border-purple-500/20 text-purple-600',
  'bg-rose-500/10 border-rose-500/20 text-rose-600',
  'bg-cyan-500/10 border-cyan-500/20 text-cyan-600',
  'bg-orange-500/10 border-orange-500/20 text-orange-600',
  'bg-indigo-500/10 border-indigo-500/20 text-indigo-600',
  'bg-teal-500/10 border-teal-500/20 text-teal-600',
  'bg-pink-500/10 border-pink-500/20 text-pink-600',
  'bg-lime-500/10 border-lime-500/20 text-lime-600',
  'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-600',
];

export function DragDropHorarioGrid({
  asignaciones,
  docenteNames,
  cursoNames,
  aulaNames,
  grupoCiclos,
  grupoCursoIds,
  tipoCiclo,
  isNonLectiva = false,
  isAulaView = false,
  periodoTipoCiclo,
  userRole = 'docente',
  onDrop,
  checkAulaAvailability,
  aulaConflicts,
}: DragDropHorarioGridProps) {
  const ciclosToShow = tipoCiclo ? getCiclosByTipo(tipoCiclo) : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const [selectedCiclo, setSelectedCiclo] = useState<string>(ciclosToShow[0]);
  const [draggedAsignacion, setDraggedAsignacion] = useState<Asignacion | null>(null);
  const [droppingCell, setDroppingCell] = useState<{ dia: string; bloque: string } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [hoverConflict, setHoverConflict] = useState<{ dia: string; bloque: string; conflict: { curso: string; docente: string; grupo: string } } | null>(null);
  const [selectedAula, setSelectedAula] = useState<string>('all');

  // Get unique aulas from asignaciones
  const uniqueAulas = useMemo(() => {
    const aulaIds = new Set<string>();
    asignaciones.forEach((a) => {
      if (a.aulaId) aulaIds.add(a.aulaId);
    });
    return Array.from(aulaIds);
  }, [asignaciones]);

  const filtered = asignaciones.filter((a) => {
    // For non-lective activities, check if they match the periodo's tipoCiclo
    if (isNonLectiva && a.grupoId?.startsWith('no-lectiva-')) {
      const actividadTipoPeriodo = (a as any).actividadNoLectiva?.tipoPeriodo;
      if (actividadTipoPeriodo && periodoTipoCiclo) {
        return actividadTipoPeriodo === periodoTipoCiclo;
      }
      // If no tipoPeriodo assigned, include it (fallback)
      return true;
    }
    // For lective activities, filter by ciclo and aula
    const cicloMatch = isAulaView ? true : grupoCiclos.get(a.grupoId) === selectedCiclo;
    const aulaMatch = selectedAula === 'all' ? !isAulaView : a.aulaId === selectedAula;
    return cicloMatch && aulaMatch;
  });

  const assignmentMap = new Map<string, Asignacion[]>();
  for (const a of filtered) {
    const key = `${a.dia}||${a.bloque}`;
    const existing = assignmentMap.get(key) ?? [];
    existing.push(a);
    assignmentMap.set(key, existing);
  }

  const cursoColorMap = useMemo(() => {
    const uniqueCursoIds: string[] = [];
    for (const a of filtered) {
      const cursoId = grupoCursoIds.get(a.grupoId) ?? a.grupoId;
      if (!uniqueCursoIds.includes(cursoId)) uniqueCursoIds.push(cursoId);
    }
    const map = new Map<string, string>();
    for (let i = 0; i < uniqueCursoIds.length; i++) {
      map.set(uniqueCursoIds[i], CURSO_PALETTE[i % CURSO_PALETTE.length]);
    }
    return map;
  }, [filtered, grupoCursoIds]);

  const mergedGrid = useMemo(() => {
    const grid = new Map<string, { span: number; assignments: Asignacion[]; timeRange: string } | null>();

    for (const dia of DIAS_SEMANA) {
      let i = 0;
      while (i < BLOQUES_HORARIOS.length) {
        const bloque = BLOQUES_HORARIOS[i];
        const key = `${dia}||${bloque}`;
        const cellAssignments = assignmentMap.get(key) ?? [];

        if (cellAssignments.length === 0) {
          grid.set(key, { span: 1, assignments: [], timeRange: '' });
          i++;
          continue;
        }

        const sig = cellAssignments
          .map((a) => `${a.grupoId}|${a.tipo}|${a.docenteId}|${a.aulaId}`)
          .sort()
          .join(';;');

        let span = 1;
        while (i + span < BLOQUES_HORARIOS.length) {
          const nextBloque = BLOQUES_HORARIOS[i + span];
          const nextAssignments = assignmentMap.get(`${dia}||${nextBloque}`) ?? [];
          const nextSig = nextAssignments
            .map((a) => `${a.grupoId}|${a.tipo}|${a.docenteId}|${a.aulaId}`)
            .sort()
            .join(';;');
          if (nextSig === sig) span++;
          else break;
        }

        const startTime = bloque.split(' - ')[0];
        const endTime = BLOQUES_HORARIOS[i + span - 1].split(' - ')[1];

        grid.set(key, { span, assignments: cellAssignments, timeRange: `${startTime} - ${endTime}` });
        for (let j = 1; j < span; j++) {
          grid.set(`${dia}||${BLOQUES_HORARIOS[i + j]}`, null);
        }

        i += span;
      }
    }

    return grid;
  }, [assignmentMap]);

  const handleDragStart = (asignacion: Asignacion) => {
    // Only allow drag and drop for director
    if (userRole !== 'director') {
      return;
    }
    setDraggedAsignacion(asignacion);
    setAvailabilityError(null);
  };

  const handleDragOver = (e: React.DragEvent, dia: string, bloque: string) => {
    e.preventDefault();
    setDroppingCell({ dia, bloque });
  };

  const handleDragLeave = () => {
    setDroppingCell(null);
  };

  const handleDrop = async (e: React.DragEvent, dia: string, bloque: string) => {
    e.preventDefault();
    setDroppingCell(null);

    // Only allow drag and drop for director and secretaria
    if (userRole !== 'director' && userRole !== 'secretaria') {
      return;
    }

    if (!draggedAsignacion || !onDrop) {
      return;
    }

    // Check if dropping on same cell
    if (draggedAsignacion.dia === dia && draggedAsignacion.bloque === bloque) {
      setDraggedAsignacion(null);
      return;
    }

    // For lectivas, check aula availability
    if (!isNonLectiva && checkAulaAvailability) {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        // Exclude the current asignacion from the check to allow moving within the same aula
        const isAvailable = await checkAulaAvailability(draggedAsignacion.aulaId, dia, bloque, draggedAsignacion.id);
        
        if (!isAvailable) {
          setAvailabilityError(`El aula ${aulaNames.get(draggedAsignacion.aulaId) || ''} no está disponible en ${dia} ${bloque}`);
          setIsCheckingAvailability(false);
          setDraggedAsignacion(null);
          return;
        }
      } catch (error) {
        console.error(error);
        setAvailabilityError('Error al verificar disponibilidad del aula');
        setIsCheckingAvailability(false);
        setDraggedAsignacion(null);
        return;
      }

      setIsCheckingAvailability(false);
    }

    // Perform the drop
    await onDrop(draggedAsignacion, dia, bloque);
    setDraggedAsignacion(null);
  };

  return (
    <div className="space-y-4">
      {!isAulaView && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filtrar por ciclo:</span>
          {ciclosToShow.map((ciclo) => (
            <button
              key={ciclo}
              onClick={() => setSelectedCiclo(ciclo)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCiclo === ciclo
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {ciclo}
            </button>
          ))}
        </div>
      )}

      {!isNonLectiva && uniqueAulas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filtrar por aula:</span>
          {!isAulaView && (
            <button
              key="all"
              onClick={() => setSelectedAula('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedAula === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todas
            </button>
          )}
          {uniqueAulas.map((aulaId) => (
            <button
              key={aulaId}
              onClick={() => setSelectedAula(aulaId)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedAula === aulaId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {aulaNames.get(aulaId) || aulaId}
            </button>
          ))}
        </div>
      )}

      {availabilityError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {availabilityError}
        </div>
      )}

      {hoverConflict && (
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-600">
          <p className="font-semibold mb-1">Aula ocupada en {hoverConflict.dia} {hoverConflict.bloque}:</p>
          <p>Curso: {hoverConflict.conflict.curso}</p>
          <p>Docente: {hoverConflict.conflict.docente}</p>
          <p>Grupo: {hoverConflict.conflict.grupo}</p>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse table-fixed">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="p-2 border-r border-border font-semibold text-muted-foreground text-center" style={{ width: 90 }}>
                  Horario
                </th>
                {DIAS_SEMANA.map((dia) => (
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
                  {DIAS_SEMANA.map((dia) => {
                    const key = `${dia}||${bloque}`;
                    const cell = mergedGrid.get(key);
                    const isDropping = droppingCell?.dia === dia && droppingCell?.bloque === bloque;

                    if (cell === null) return null;

                    const isDropTarget = !cell || cell.assignments.length === 0;

                    // Check for aula conflicts in this cell
                    let cellConflict: { curso: string; docente: string; grupo: string } | null = null;
                    if (aulaConflicts && draggedAsignacion?.aulaId) {
                      // Only check conflicts for the selected aula
                      const aulaToCheck = selectedAula === 'all' ? draggedAsignacion.aulaId : selectedAula;
                      const conflictKey = `${dia}||${bloque}||${aulaToCheck}`;
                      cellConflict = aulaConflicts.get(conflictKey) || null;
                    }

                    return (
                      <td
                        key={dia}
                        rowSpan={cell?.span || 1}
                        className={`p-1 border-r border-border last:border-r-0 transition-colors ${
                          isDropping && isDropTarget ? 'bg-primary/20' : ''
                        } ${cellConflict ? 'bg-red-500/10' : ''} ${
                          isDropTarget && onDrop && !cellConflict ? 'cursor-pointer hover:bg-muted/30' : ''
                        }`}
                        style={{ height: cell?.span ? cell.span * 48 : 48 }}
                        onDragOver={(e) => handleDragOver(e, dia, bloque)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, dia, bloque)}
                        onMouseEnter={() => cellConflict && setHoverConflict({ dia, bloque, conflict: cellConflict })}
                        onMouseLeave={() => setHoverConflict(null)}
                      >
                        {!cell || cell.assignments.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs">
                            {isDropping ? 'Soltar aquí' : ''}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 h-full">
                            {cell.assignments.map((a) => {
                              const cursoId = grupoCursoIds.get(a.grupoId) ?? a.grupoId;
                              const colorClass = cursoColorMap.get(cursoId ?? '') ?? 'bg-muted border-border text-foreground';
                              
                              // Check if this is a non-lective activity (grupoId starts with 'no-lectiva-')
                              const isNonLectiva = a.grupoId?.startsWith('no-lectiva-');
                              const actividadNoLectiva = (a as any).actividadNoLectiva;

                              return (
                                <div
                                  key={a.id}
                                  draggable={onDrop ? true : false}
                                  onDragStart={() => handleDragStart(a)}
                                  className={`rounded border px-1.5 py-1.5 flex-1 flex flex-col justify-center ${
                                    isNonLectiva ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : colorClass
                                  } ${
                                    onDrop ? 'cursor-move hover:ring-2 hover:ring-primary/40 transition-shadow' : ''
                                  }`}
                                >
                                  <p className="font-bold text-[11px] leading-tight truncate">
                                    {isNonLectiva ? actividadNoLectiva?.tipo || 'No lectiva' : (cursoNames.get(a.grupoId) ?? 'Curso')}
                                  </p>
                                  <p className="text-[10px] leading-tight truncate opacity-80 mt-0.5">
                                    {isNonLectiva ? actividadNoLectiva?.detalles || '' : (docenteNames.get(a.docenteId) ?? '')}
                                  </p>
                                  <p className="text-[10px] leading-tight truncate opacity-70">
                                    {isNonLectiva 
                                      ? `${actividadNoLectiva?.horas || 0}h` 
                                      : isAulaView 
                                        ? `Ciclo ${grupoCiclos.get(a.grupoId) ?? ''} · ${ASIGNACION_TIPO_LABELS[a.tipo]}`
                                        : `${aulaNames.get(a.aulaId) ?? ''} · ${ASIGNACION_TIPO_LABELS[a.tipo]}`
                                    }
                                  </p>
                                  {cell.span > 1 && (
                                    <p className="text-[9px] font-semibold opacity-60 mt-0.5">
                                      {cell.timeRange}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
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

      {isCheckingAvailability && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Verificando disponibilidad del aula...
        </div>
      )}
    </div>
  );
}
