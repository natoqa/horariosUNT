'use client';

import { Clock, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DisponibilidadSummaryProps {
  availableCount: number;
  preferredCount: number;
  minRequired: number;
  regimen: string;
}

export function DisponibilidadSummary({
  availableCount,
  preferredCount,
  minRequired,
  regimen,
}: DisponibilidadSummaryProps) {
  const totalAvailable = availableCount + preferredCount;
  const meetsMinimum = totalAvailable >= minRequired;
  const percentage = Math.min((totalAvailable / minRequired) * 100, 100);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Resumen de disponibilidad</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            {meetsMinimum ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className={`text-lg font-bold ${meetsMinimum ? 'text-emerald-600' : 'text-destructive'}`}>
            {totalAvailable}h
          </p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Mínimo</span>
          </div>
          <p className="text-lg font-bold text-foreground">{minRequired}h</p>
          <p className="text-[10px] text-muted-foreground">{regimen}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progreso hacia el mínimo requerido</span>
          <span className={`font-semibold ${meetsMinimum ? 'text-emerald-600' : 'text-destructive'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              meetsMinimum ? 'bg-emerald-500' : 'bg-destructive'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {!meetsMinimum && (
          <p className="text-xs text-destructive">
            Faltan {minRequired - totalAvailable} horas para alcanzar el mínimo requerido.
          </p>
        )}
      </div>
    </div>
  );
}
