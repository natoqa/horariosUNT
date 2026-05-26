'use client';

import { useState } from 'react';
import { Periodo, getNextStates } from '../../domain/entities/periodo.entity';
import { changeStateAction } from '../actions/change-state.action';
import { deletePeriodoAction } from '../actions/delete-periodo.action';
import { Button } from '@/shared/components/ui/button';
import { EstadoPeriodo } from '@/shared/constants/period-states';
import { Trash2 } from 'lucide-react';

interface PeriodoStateActionsProps {
  periodo: Periodo;
  onStateChanged: () => void;
}

const STATE_ACTION_LABELS: Record<EstadoPeriodo, string> = {
  'Configuración': 'Configurar',
  'Recopilación': 'Abrir Recopilacion',
  'Generación': 'Iniciar Generacion',
  'Aprobado': 'Aprobar',
  'Publicado': 'Publicar',
  'Cerrado': 'Cerrar',
};

export function PeriodoStateActions({
  periodo,
  onStateChanged,
}: PeriodoStateActionsProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStates = getNextStates(periodo.state);
  const canDelete = periodo.state === 'Configuración' || periodo.state === 'Cerrado';

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

  const handleDelete = async () => {
    if (!confirm('¿Estas seguro de eliminar este periodo? Esta accion no se puede deshacer.')) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await deletePeriodoAction(periodo.id);
    if (result.success) {
      onStateChanged();
    } else {
      setError(result.message || 'Error al eliminar');
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
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={pending}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Eliminar periodo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
