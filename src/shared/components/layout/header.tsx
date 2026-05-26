'use client'

import { usePathname } from 'next/navigation';
import { Bell, Settings, LayoutGrid } from 'lucide-react';

const breadcrumbLabels: Record<string, string> = {
  director: 'Panel Director',
  secretaria: 'Panel Secretaría',
  docente: 'Panel Docente',
  periodos: 'Periodos',
  docentes: 'Docentes',
  cursos: 'Cursos',
  aulas: 'Aulas',
  horarios: 'Horarios',
  disponibilidad: 'Disponibilidad',
  reportes: 'Reportes',
  configuracion: 'Configuración',
  ayuda: 'Ayuda',
  comentarios: 'Comentarios',
};

export function Header() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg) => breadcrumbLabels[seg] || seg);

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-muted-foreground/40">/</span>}
            <span className={idx === crumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
