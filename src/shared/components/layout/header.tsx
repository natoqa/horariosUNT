'use client'

import { usePathname } from 'next/navigation';
import { Bell, Settings, LayoutGrid, Menu } from 'lucide-react';

const breadcrumbLabels: Record<string, string> = {
  director: 'Panel Director',
  secretaria: 'Panel Secretaria',
  docente: 'Panel Docente',
  periodos: 'Periodos',
  docentes: 'Docentes',
  cursos: 'Cursos',
  aulas: 'Aulas',
  horarios: 'Horarios',
  disponibilidad: 'Disponibilidad',
  reportes: 'Reportes',
  configuracion: 'Configuracion',
  ayuda: 'Ayuda',
  comentarios: 'Comentarios',
};

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg) => breadcrumbLabels[seg] || seg);

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <LayoutGrid className="w-4 h-4 text-muted-foreground hidden md:block" />
        <div className="hidden md:flex items-center gap-2">
          {crumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-muted-foreground/40">/</span>}
              <span className={idx === crumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
        {/* Mobile: only show last crumb */}
        <span className="font-semibold text-foreground md:hidden">
          {crumbs[crumbs.length - 1] || 'Dashboard'}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors hidden md:block">
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
