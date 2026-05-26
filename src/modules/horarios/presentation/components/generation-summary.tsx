'use client';

import { CheckCircle2, AlertTriangle, BarChart3, Users, Clock } from 'lucide-react';
import { GenerationSummary } from '../../domain/entities/horario.entity';
import { UnassignedUnit } from '../../domain/services/schedule-generator.service';
import { ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';

interface GenerationSummaryPanelProps {
  summary: GenerationSummary;
  unassigned: UnassignedUnit[];
}

export function GenerationSummaryPanel({ summary, unassigned }: GenerationSummaryPanelProps) {
  const allAssigned = summary.cursosNoAsignados === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        {allAssigned ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        )}
        <h3 className="text-sm font-semibold text-foreground">Resumen de generación</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Asignados</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            {summary.cursosAsignados}/{summary.totalCursos}
          </p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Preferencias</span>
          </div>
          <p className="text-lg font-bold text-foreground">{summary.porcentajePreferencias}%</p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Carga promedio</span>
          </div>
          <p className="text-lg font-bold text-foreground">{summary.cargaPromedio}h</p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Rango carga</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {summary.cargaMinima}-{summary.cargaMaxima}h
          </p>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-destructive">
            Unidades sin asignar ({unassigned.length})
          </h4>
          <div className="space-y-1">
            {unassigned.map((u, i) => (
              <div
                key={`${u.grupoId}-${u.tipo}-${i}`}
                className="flex items-center gap-2 text-xs rounded-md bg-destructive/5 border border-destructive/10 px-3 py-2"
              >
                <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                <span className="text-foreground font-medium">{u.cursoNombre}</span>
                <span className="text-muted-foreground">({ASIGNACION_TIPO_LABELS[u.tipo]})</span>
                <span className="text-muted-foreground ml-auto">{u.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
