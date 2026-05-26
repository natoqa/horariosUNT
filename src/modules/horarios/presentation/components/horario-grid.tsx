'use client';

import { useState } from 'react';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Asignacion, ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';

interface HorarioGridProps {
  asignaciones: Asignacion[];
  docenteNames: Map<string, string>;
  cursoNames: Map<string, string>;
  aulaNames: Map<string, string>;
  grupoCiclos: Map<string, string>;
  editable?: boolean;
  onSelectAsignacion?: (asignacion: Asignacion) => void;
}

const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

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

export function HorarioGrid({
  asignaciones,
  docenteNames,
  cursoNames,
  aulaNames,
  grupoCiclos,
  editable = false,
  onSelectAsignacion,
}: HorarioGridProps) {
  const [selectedCiclo, setSelectedCiclo] = useState<string | null>(null);

  const filtered = selectedCiclo
    ? asignaciones.filter((a) => grupoCiclos.get(a.grupoId) === selectedCiclo)
    : asignaciones;

  const assignmentMap = new Map<string, Asignacion[]>();
  for (const a of filtered) {
    const key = `${a.dia}||${a.bloque}`;
    const existing = assignmentMap.get(key) ?? [];
    existing.push(a);
    assignmentMap.set(key, existing);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Filtrar por ciclo:</span>
        <button
          onClick={() => setSelectedCiclo(null)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedCiclo === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Todos
        </button>
        {CICLOS.map((ciclo) => (
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
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="p-2 border-r border-border font-semibold text-muted-foreground w-24 text-center">
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
                    const cellAssignments = assignmentMap.get(key) ?? [];

                    return (
                      <td key={dia} className="p-1 border-r border-border align-top last:border-r-0">
                        {cellAssignments.length > 0 ? (
                          <div className="space-y-1">
                            {cellAssignments.map((a) => {
                              const ciclo = grupoCiclos.get(a.grupoId) ?? '';
                              const colorClass = CICLO_COLORS[ciclo] ?? 'bg-muted border-border text-foreground';

                              return (
                                <div
                                  key={a.id}
                                  onClick={editable && onSelectAsignacion ? () => onSelectAsignacion(a) : undefined}
                                  className={`rounded border px-1.5 py-1 ${colorClass}${editable ? ' cursor-pointer hover:ring-2 hover:ring-primary/40 transition-shadow' : ''}`}
                                >
                                  <p className="font-semibold text-[10px] leading-tight truncate">
                                    {cursoNames.get(a.grupoId) ?? 'Curso'}
                                  </p>
                                  <p className="text-[9px] leading-tight truncate opacity-80">
                                    {docenteNames.get(a.docenteId) ?? ''}
                                  </p>
                                  <p className="text-[9px] leading-tight truncate opacity-70">
                                    {aulaNames.get(a.aulaId) ?? ''} · {ASIGNACION_TIPO_LABELS[a.tipo]}
                                  </p>
                                </div>
                              );
                            })}
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
