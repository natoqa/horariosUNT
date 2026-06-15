'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Asignacion, ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';
import { type TipoCiclo, getCiclosByTipo } from '@/modules/periodos';

interface HorarioGridProps {
  asignaciones: Asignacion[];
  docenteNames: Map<string, string>;
  cursoNames: Map<string, string>;
  aulaNames: Map<string, string>;
  grupoCiclos: Map<string, string>;
  grupoCursoIds: Map<string, string>;
  tipoCiclo?: TipoCiclo;
  editable?: boolean;
  onSelectAsignacion?: (asignacion: Asignacion) => void;
}

const CURSO_PALETTE = [
  'bg-blue-50 border-blue-300 text-blue-900',
  'bg-emerald-50 border-emerald-300 text-emerald-900',
  'bg-amber-50 border-amber-300 text-amber-900',
  'bg-purple-50 border-purple-300 text-purple-900',
  'bg-rose-50 border-rose-300 text-rose-900',
  'bg-cyan-50 border-cyan-300 text-cyan-900',
  'bg-orange-50 border-orange-300 text-orange-900',
  'bg-indigo-50 border-indigo-300 text-indigo-900',
  'bg-teal-50 border-teal-300 text-teal-900',
  'bg-pink-50 border-pink-300 text-pink-900',
  'bg-lime-50 border-lime-300 text-lime-900',
  'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900',
];

export function HorarioGrid({
  asignaciones,
  docenteNames,
  cursoNames,
  aulaNames,
  grupoCiclos,
  grupoCursoIds,
  tipoCiclo,
  editable = false,
  onSelectAsignacion,
}: HorarioGridProps) {
  const ciclosToShow = tipoCiclo ? getCiclosByTipo(tipoCiclo) : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const [selectedCiclo, setSelectedCiclo] = useState<string>(ciclosToShow[0]);

  const filtered = asignaciones.filter((a) => grupoCiclos.get(a.grupoId) === selectedCiclo);

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

  const missingCursos = useMemo(() => {
    const assignedGrupoIds = new Set(filtered.map((a) => a.grupoId));
    const missing: { grupoId: string; nombre: string }[] = [];
    for (const [grupoId, ciclo] of grupoCiclos) {
      if (ciclo === selectedCiclo && !assignedGrupoIds.has(grupoId)) {
        missing.push({ grupoId, nombre: cursoNames.get(grupoId) ?? 'Curso desconocido' });
      }
    }
    return missing.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [filtered, grupoCiclos, selectedCiclo, cursoNames]);

  return (
    <div className="space-y-4">
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

                    if (cell === null) return null;

                    if (!cell || cell.assignments.length === 0) {
                      return (
                        <td key={dia} className="p-1 border-r border-border align-top last:border-r-0">
                          <div className="h-12" />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={dia}
                        rowSpan={cell.span}
                        className="p-1 border-r border-border last:border-r-0"
                        style={{ height: 1 }}
                      >
                        <div className="flex flex-col gap-1 h-full">
                          {cell.assignments.map((a) => {
                            const cursoId = grupoCursoIds.get(a.grupoId) ?? a.grupoId;
                            const colorClass = cursoColorMap.get(cursoId) ?? 'bg-muted border-border text-foreground';

                            return (
                              <div
                                key={a.id}
                                onClick={editable && onSelectAsignacion ? () => onSelectAsignacion(a) : undefined}
                                className={`rounded border px-1.5 py-1.5 flex-1 flex flex-col justify-center ${colorClass}${editable ? ' cursor-pointer hover:ring-2 hover:ring-primary/40 transition-shadow' : ''}`}
                              >
                                <p className="font-bold text-[11px] leading-tight truncate">
                                  {cursoNames.get(a.grupoId) ?? 'Curso'}
                                </p>
                                <p className="text-[10px] leading-tight truncate opacity-80 mt-0.5">
                                  {docenteNames.get(a.docenteId) ?? ''}
                                </p>
                                <p className="text-[10px] leading-tight truncate opacity-70">
                                  {aulaNames.get(a.aulaId) ?? ''} · {ASIGNACION_TIPO_LABELS[a.tipo]}
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
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {missingCursos.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
              Cursos del ciclo {selectedCiclo} sin asignar ({missingCursos.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingCursos.map((c) => (
              <span
                key={c.grupoId}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
              >
                {c.nombre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
