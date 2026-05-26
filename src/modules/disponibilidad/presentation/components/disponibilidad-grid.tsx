'use client';

import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import {
  DisponibilidadEstado,
  DISPONIBILIDAD_LABELS,
} from '../../domain/entities/disponibilidad.entity';
import { Clock, Star, X } from 'lucide-react';

interface DisponibilidadGridProps {
  gridState: Map<string, DisponibilidadEstado>;
  onToggle: (dia: DiaSemana, bloque: BloqueHorario) => void;
  disabled: boolean;
}

function makeKey(dia: DiaSemana, bloque: BloqueHorario): string {
  return `${dia}||${bloque}`;
}

const ESTADO_CYCLE: DisponibilidadEstado[] = ['no_disponible', 'disponible', 'preferido'];

function getNextEstado(current: DisponibilidadEstado): DisponibilidadEstado {
  const index = ESTADO_CYCLE.indexOf(current);
  return ESTADO_CYCLE[(index + 1) % ESTADO_CYCLE.length];
}

function getCellStyles(estado: DisponibilidadEstado): string {
  switch (estado) {
    case 'disponible':
      return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/50 text-emerald-700';
    case 'preferido':
      return 'bg-amber-50 hover:bg-amber-100 border-amber-200/50 text-amber-700';
    case 'no_disponible':
      return 'bg-card hover:bg-muted/30 text-muted-foreground/40';
  }
}

function getCellIcon(estado: DisponibilidadEstado) {
  switch (estado) {
    case 'disponible':
      return <Clock className="w-3 h-3" />;
    case 'preferido':
      return <Star className="w-3 h-3" />;
    case 'no_disponible':
      return <X className="w-3 h-3" />;
  }
}

export { makeKey, getNextEstado };

export function DisponibilidadGrid({ gridState, onToggle, disabled }: DisponibilidadGridProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-foreground">Leyenda:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
            <Clock className="w-3 h-3" />
            {DISPONIBILIDAD_LABELS.disponible}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">
            <Star className="w-3 h-3" />
            {DISPONIBILIDAD_LABELS.preferido}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">
            <X className="w-3 h-3" />
            {DISPONIBILIDAD_LABELS.no_disponible}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="p-2 border-r border-border font-semibold text-muted-foreground w-28 text-center">
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
              <tr key={bloque} className="transition-colors">
                <td className="p-2 border-r border-border font-semibold text-muted-foreground text-center bg-muted/10 font-mono">
                  {bloque}
                </td>
                {DIAS_SEMANA.map((dia) => {
                  const key = makeKey(dia, bloque);
                  const estado = gridState.get(key) ?? 'no_disponible';
                  return (
                    <td
                      key={dia}
                      onClick={disabled ? undefined : () => onToggle(dia, bloque)}
                      className={`p-2 border-r border-border text-center select-none transition-all duration-200 last:border-r-0 ${
                        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${getCellStyles(estado)}`}
                    >
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                        {getCellIcon(estado)}
                        {DISPONIBILIDAD_LABELS[estado]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
