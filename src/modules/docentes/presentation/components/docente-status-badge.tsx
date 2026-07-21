interface DocenteStatusBadgeProps {
  estado: 'Activo' | 'Inactivo';
}

export function DocenteStatusBadge({ estado }: DocenteStatusBadgeProps) {
  const config = estado === 'Activo'
    ? { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' }
    : { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {estado}
    </span>
  );
}
