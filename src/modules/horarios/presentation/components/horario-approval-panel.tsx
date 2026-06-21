'use client';

import { useState } from 'react';
import { CheckCircle2, Send, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { HorarioEstado, HORARIO_ESTADO_LABELS } from '../../domain/entities/horario.entity';
import { Violation } from '../../domain/services/constraint-validator.service';
import { approveHorarioAction } from '../actions/approve-horario.action';
import { publishHorarioAction } from '../actions/publish-horario.action';
import { EstadoPeriodo } from '@/shared/constants/period-states';

interface HorarioApprovalPanelProps {
  horarioId: string;
  horarioEstado: HorarioEstado;
  periodoEstado: EstadoPeriodo;
  onStateChanged: () => void;
}

export function HorarioApprovalPanel({
  horarioId,
  horarioEstado,
  periodoEstado,
  onStateChanged,
}: HorarioApprovalPanelProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);

  const canApprove = horarioEstado === 'Borrador' && (periodoEstado === 'Generación' || periodoEstado === 'Publicado');
  const canPublish = horarioEstado === 'Aprobado' && (periodoEstado === 'Aprobado' || periodoEstado === 'Publicado');
  const needsFix = false; // Ya no necesita fix porque usamos mayúsculas

  console.log('[HorarioApprovalPanel] horarioEstado:', horarioEstado);
  console.log('[HorarioApprovalPanel] periodoEstado:', periodoEstado);
  console.log('[HorarioApprovalPanel] canApprove:', canApprove);
  console.log('[HorarioApprovalPanel] canPublish:', canPublish);

  const handleApprove = async () => {
    if (!confirm('¿Está seguro de aprobar este horario? Se validarán todos los conflictos antes de aprobar.')) {
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);
    setViolations([]);

    const result = await approveHorarioAction(horarioId);

    if (result.success) {
      setSuccess(result.message ?? 'Horario aprobado exitosamente.');
      onStateChanged();
    } else {
      setError(result.message ?? 'Error al aprobar.');
      if (result.violations) {
        setViolations(result.violations);
      }
    }

    setPending(false);
  };

  const handlePublish = async () => {
    if (!confirm('¿Está seguro de publicar este horario? Una vez publicado, los docentes podrán consultarlo.')) {
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);
    setViolations([]);

    const result = await publishHorarioAction(horarioId);

    if (result.success) {
      setSuccess(result.message ?? 'Horario publicado exitosamente.');
      onStateChanged();
    } else {
      setError(result.message ?? 'Error al publicar.');
    }

    setPending(false);
  };

  const estadoLabel = HORARIO_ESTADO_LABELS[horarioEstado] ?? horarioEstado;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Aprobación y Publicación</h3>
            <p className="text-xs text-muted-foreground">
              Estado del horario: <span className="font-medium">{estadoLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={handleApprove}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              Aprobar
            </Button>
          )}
          {canPublish && (
            <Button
              size="sm"
              disabled={pending}
              onClick={handlePublish}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              Publicar
            </Button>
          )}
          {horarioEstado === 'Publicado' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Publicado
            </span>
          )}
        </div>
      </div>

      {violations.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Conflictos detectados ({violations.length})
            </p>
          </div>
          <ul className="space-y-1 ml-6">
            {violations.map((v, i) => (
              <li key={i} className="text-xs text-destructive/80">
                <span className="font-mono font-medium">{v.rule}</span>: {v.message}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Resuelva los conflictos editando las asignaciones antes de aprobar.
          </p>
        </div>
      )}

      {error && violations.length === 0 && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}
    </div>
  );
}
