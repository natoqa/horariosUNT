'use client';

import { Zap, PenLine } from 'lucide-react';

interface ManualModeSelectorProps {
  onSelectAutomatic: () => void;
  onSelectManual: () => void;
  disabled?: boolean;
}

export function ManualModeSelector({
  onSelectAutomatic,
  onSelectManual,
  disabled = false,
}: ManualModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={onSelectAutomatic}
        disabled={disabled}
        className="group relative rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Generación Automática</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              El algoritmo asigna todo automáticamente respetando restricciones, disponibilidad y prioridades por rango docente.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                CSP Algorithm
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Optimización
              </span>
            </div>
          </div>
        </div>
      </button>

      <button
        onClick={onSelectManual}
        disabled={disabled}
        className="group relative rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
            <PenLine className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Creación Manual Guiada</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Asigne curso por curso con opciones ordenadas por rango docente. Control total con validación en tiempo real.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Guiado por rangos
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                Control total
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
