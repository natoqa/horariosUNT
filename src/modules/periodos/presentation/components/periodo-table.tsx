'use client';

import { useEffect, useState, useCallback } from 'react';
import { Periodo } from '../../domain/entities/periodo.entity';
import { getPeriodosAction } from '../actions/get-periodos.action';
import { PeriodoStatusBadge } from './periodo-status-badge';
import { PeriodoStateActions } from './periodo-state-actions';

export function PeriodoTable() {
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
      setError(result.message || 'Error al cargar períodos.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPeriodos();
  }, [loadPeriodos]);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando períodos...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (periodos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay períodos académicos registrados.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left font-medium">Nombre</th>
            <th className="h-10 px-4 text-left font-medium">Fecha Inicio</th>
            <th className="h-10 px-4 text-left font-medium">Fecha Fin</th>
            <th className="h-10 px-4 text-left font-medium">
              Límite Disponibilidad
            </th>
            <th className="h-10 px-4 text-left font-medium">Estado</th>
            <th className="h-10 px-4 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {periodos.map((periodo) => (
            <tr key={periodo.id} className="border-b">
              <td className="p-4 font-medium">{periodo.name}</td>
              <td className="p-4">
                {new Date(periodo.startDate).toLocaleDateString('es-PE')}
              </td>
              <td className="p-4">
                {new Date(periodo.endDate).toLocaleDateString('es-PE')}
              </td>
              <td className="p-4">
                {new Date(periodo.availabilityDeadline).toLocaleDateString(
                  'es-PE',
                )}
              </td>
              <td className="p-4">
                <PeriodoStatusBadge state={periodo.state} />
              </td>
              <td className="p-4">
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
}
