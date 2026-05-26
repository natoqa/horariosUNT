'use client';

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Periodo } from '../../domain/entities/periodo.entity';
import { getPeriodosAction } from '../actions/get-periodos.action';
import { PeriodoStatusBadge } from './periodo-status-badge';
import { PeriodoStateActions } from './periodo-state-actions';

export interface PeriodoTableRef {
  refresh: () => void;
}

export const PeriodoTable = forwardRef<PeriodoTableRef>(function PeriodoTable(_, ref) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeriodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPeriodosAction();
    if (result.data) {
      setPeriodos(result.data);
    } else {
      setError(result.message || 'Error al cargar periodos.');
    }
    setLoading(false);
  }, []);

  useImperativeHandle(ref, () => ({ refresh: loadPeriodos }));

  useEffect(() => {
    loadPeriodos();
  }, [loadPeriodos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Cargando periodos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (periodos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-muted-foreground">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">Sin periodos registrados</p>
        <p className="text-xs text-muted-foreground mt-1">Crea el primer periodo academico usando el formulario de arriba</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ciclos</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Inicio</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Fin</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Limite Disp.</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
            <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {periodos.map((periodo) => (
            <tr key={periodo.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="px-6 py-3.5 font-medium text-foreground">{periodo.name}</td>
              <td className="px-6 py-3.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  periodo.tipoCiclo === 'Impar'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-violet-50 text-violet-700 border border-violet-100'
                }`}>
                  {periodo.tipoCiclo === 'Impar' ? 'Impar (I,III,V,VII,IX)' : 'Par (II,IV,VI,VIII,X)'}
                </span>
              </td>
              <td className="px-6 py-3.5 text-muted-foreground">
                {new Date(periodo.startDate).toLocaleDateString('es-PE')}
              </td>
              <td className="px-6 py-3.5 text-muted-foreground">
                {new Date(periodo.endDate).toLocaleDateString('es-PE')}
              </td>
              <td className="px-6 py-3.5 text-muted-foreground">
                {new Date(periodo.availabilityDeadline).toLocaleDateString('es-PE')}
              </td>
              <td className="px-6 py-3.5">
                <PeriodoStatusBadge state={periodo.state} />
              </td>
              <td className="px-6 py-3.5">
                <PeriodoStateActions
                  periodo={periodo}
                  onStateChanged={loadPeriodos}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
