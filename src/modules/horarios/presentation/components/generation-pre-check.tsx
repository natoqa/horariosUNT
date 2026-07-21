'use client';

import { CheckCircle2, XCircle, Users, BookOpen, Building2, CalendarDays } from 'lucide-react';
import { PreValidationResult } from '../../application/use-cases/validate-pre-generation.use-case';

interface GenerationPreCheckProps {
  result: PreValidationResult;
}

interface CheckItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ok: boolean;
  detail: string;
}

export function GenerationPreCheck({ result }: GenerationPreCheckProps) {
  const periodoErrors = result.errors.filter((e) => e.category === 'periodo');
  const docenteErrors = result.errors.filter((e) => e.category === 'docentes');
  const cursoErrors = result.errors.filter((e) => e.category === 'cursos');
  const aulaErrors = result.errors.filter((e) => e.category === 'aulas');

  const checks: CheckItem[] = [
    {
      label: 'Período en estado "Generación"',
      icon: CalendarDays,
      ok: periodoErrors.length === 0,
      detail: periodoErrors[0]?.message ?? 'Estado correcto',
    },
    {
      label: 'Docentes con disponibilidad',
      icon: Users,
      ok: docenteErrors.length === 0,
      detail: docenteErrors[0]?.message ?? `${result.stats.docentesConDisponibilidad}/${result.stats.totalDocentes} con disponibilidad`,
    },
    {
      label: 'Cursos y grupos configurados',
      icon: BookOpen,
      ok: cursoErrors.length === 0,
      detail: cursoErrors[0]?.message ?? `${result.stats.totalCursos} cursos, ${result.stats.totalGrupos} grupos`,
    },
    {
      label: 'Aulas disponibles',
      icon: Building2,
      ok: aulaErrors.length === 0,
      detail: aulaErrors[0]?.message ?? `${result.stats.totalAulas} aulas activas`,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Validación pre-generación</h3>

      <div className="space-y-3">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.label}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                check.ok
                  ? 'border-emerald-500/20 bg-emerald-500/10/50'
                  : 'border-destructive/20 bg-destructive/5'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {check.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{check.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
