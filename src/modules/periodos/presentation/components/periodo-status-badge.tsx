import { EstadoPeriodo } from '@/shared/constants/period-states';

const STATE_STYLES: Record<EstadoPeriodo, { bg: string; text: string; dot: string }> = {
  'Configuración': { bg: 'bg-muted', text: 'text-foreground', dot: 'bg-muted-foreground' },
  'Recopilación': { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  'Generación': { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  'Aprobado': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  'Publicado': { bg: 'bg-violet-500/10', text: 'text-violet-600', dot: 'bg-violet-500' },
  'Cerrado': { bg: 'bg-muted/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground/50' },
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
