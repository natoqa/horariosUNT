'use client';

import { useState } from 'react';
import { Periodo, getNextStates } from '../../domain/entities/periodo.entity';
import { changeStateAction } from '../actions/change-state.action';
import { Button } from '@/shared/components/ui/button';
import { EstadoPeriodo } from '@/shared/constants/period-states';

interface PeriodoStateActionsProps {
  periodo: Periodo;
  onStateChanged: () => void;
}

const STATE_ACTION_LABELS: Record<EstadoPeriodo, string> = {
  Configuración: 'Configurar',
  Recopilación: 'Abrir Recopilación',
  Generación: 'Iniciar Generación',
  Aprobado: 'Aprobar',
  Publicado: 'Publicar',
  Cerrado: 'Cerrar',
};

export function PeriodoStateActions({
  periodo,
  onStateChanged,
}: PeriodoStateActionsProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStates = getNextStates(periodo.state);

  if (nextStates.length === 0) return null;

  const handleChangeState = async (newState: EstadoPeriodo) => {
    setPending(true);
    setError(null);
    const result = await changeStateAction(periodo.id, newState);
    if (result.success) {
      onStateChanged();
    } else {
      setError(result.message || 'Error al cambiar estado');
    }
    setPending(false);
  };

  return (
    <div className="flex items-center gap-2">
      {nextStates.map((nextState) => (
        <Button
          key={nextState}
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => handleChangeState(nextState)}
        >
          {STATE_ACTION_LABELS[nextState]}
        </Button>
      ))}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
