import { EstadoPeriodo } from '@/shared/constants/period-states';

const STATE_STYLES: Record<EstadoPeriodo, { bg: string; text: string; dot: string }> = {
  'Configuración': { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
  'Recopilación': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Generación': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Aprobado': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Publicado': { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  'Cerrado': { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' },
};

export function PeriodoStatusBadge({ state }: { state: EstadoPeriodo }) {
  const style = STATE_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {state}
    </span>
  );
}
