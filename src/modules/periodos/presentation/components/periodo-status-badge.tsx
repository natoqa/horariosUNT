import { EstadoPeriodo } from '@/shared/constants/period-states';

const STATE_COLORS: Record<EstadoPeriodo, string> = {
  Configuración: 'bg-gray-100 text-gray-700',
  Recopilación: 'bg-blue-100 text-blue-700',
  Generación: 'bg-yellow-100 text-yellow-700',
  Aprobado: 'bg-green-100 text-green-700',
  Publicado: 'bg-emerald-100 text-emerald-700',
  Cerrado: 'bg-slate-100 text-slate-500',
};

export function PeriodoStatusBadge({ state }: { state: EstadoPeriodo }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[state]}`}
    >
      {state}
    </span>
  );
}
