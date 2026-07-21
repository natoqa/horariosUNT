'use client';

import { useState, useEffect } from 'react';
import { Loader2, Clock, Star, X, User2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import {
  DisponibilidadEstado,
  DISPONIBILIDAD_LABELS,
} from '../../domain/entities/disponibilidad.entity';
import { getDocenteDisponibilidadAction } from '../actions/get-docente-disponibilidad.action';
import type { DocenteResumen } from '../actions/get-director-resumen.action';

interface DocenteDisponibilidadModalProps {
  docente: DocenteResumen | null;
  periodoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function makeKey(dia: DiaSemana, bloque: BloqueHorario): string {
  return `${dia}||${bloque}`;
}

function getCellStyles(estado: DisponibilidadEstado): string {
  switch (estado) {
    case 'disponible':
      return 'bg-emerald-500/10 border-emerald-500/20/50 text-emerald-600';
    case 'preferido':
      return 'bg-amber-500/10 border-amber-500/20/50 text-amber-600';
    case 'no_disponible':
      return 'bg-card text-muted-foreground/40';
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

export function DocenteDisponibilidadModal({
  docente,
  periodoId,
  open,
  onOpenChange,
}: DocenteDisponibilidadModalProps) {
  const [loading, setLoading] = useState(false);
  const [gridState, setGridState] = useState<Map<string, DisponibilidadEstado>>(new Map());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !docente) {
      setGridState(new Map());
      setErrorMsg(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      const result = await getDocenteDisponibilidadAction(docente.id, periodoId);

      if (result.message) {
        setErrorMsg(result.message);
        setLoading(false);
        return;
      }

      const newGrid = new Map<string, DisponibilidadEstado>();
      if (result.data) {
        for (const d of result.data) {
          newGrid.set(makeKey(d.dia, d.bloque), d.estado);
        }
      }
      setGridState(newGrid);
      setLoading(false);
    };

    fetchData();
  }, [open, docente, periodoId]);

  const availableCount = Array.from(gridState.values()).filter((e) => e === 'disponible').length;
  const preferredCount = Array.from(gridState.values()).filter((e) => e === 'preferido').length;
  const totalAvailable = availableCount + preferredCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {docente ? `${docente.apellidos}, ${docente.nombres}` : 'Docente'}
              </DialogTitle>
              <DialogDescription>
                {docente && (
                  <span className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{docente.categoria}</Badge>
                    <Badge variant="outline">{docente.regimen}</Badge>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Cargando disponibilidad...</p>
          </div>
        ) : errorMsg ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Disponibles</span>
                </div>
                <p className="text-lg font-bold text-foreground">{availableCount}h</p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-xs font-medium">Preferidas</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{preferredCount}h</p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{totalAvailable}h</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs px-1">
              <span className="font-semibold text-foreground">Leyenda:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
                <Clock className="w-3 h-3" />
                {DISPONIBILIDAD_LABELS.disponible}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-medium">
                <Star className="w-3 h-3" />
                {DISPONIBILIDAD_LABELS.preferido}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                <X className="w-3 h-3" />
                {DISPONIBILIDAD_LABELS.no_disponible}
              </span>
            </div>

            {/* Grid */}
            <div className="rounded-xl border border-border overflow-hidden bg-card">
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
                              className={`p-2 border-r border-border text-center select-none last:border-r-0 ${getCellStyles(estado)}`}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
