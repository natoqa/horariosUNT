'use client';

import { Loader2 } from 'lucide-react';

const PHASE_NAMES = [
  'Validando información',
  'Filtrando disponibilidad',
  'Clasificando restricciones',
  'Priorizando docentes',
  'Asignando cursos a docentes',
  'Asignando bloques y aulas',
  'Validando conflictos',
  'Optimizando',
  'Generando resumen',
];

interface GenerationProgressProps {
  currentPhase: number;
}

export function GenerationProgress({ currentPhase }: GenerationProgressProps) {
  const progress = Math.round((currentPhase / PHASE_NAMES.length) * 100);
  const phaseName = PHASE_NAMES[currentPhase - 1] ?? 'Procesando...';

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Generando horario...</h3>
          <p className="text-xs text-muted-foreground">
            Fase {currentPhase} de {PHASE_NAMES.length}: {phaseName}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Fase {currentPhase}/{PHASE_NAMES.length}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {PHASE_NAMES.map((name, i) => (
          <div
            key={name}
            className={`text-[10px] px-2 py-1 rounded ${
              i + 1 < currentPhase
                ? 'bg-emerald-500/10 text-emerald-600'
                : i + 1 === currentPhase
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {i + 1}. {name}
          </div>
        ))}
      </div>
    </div>
  );
}
