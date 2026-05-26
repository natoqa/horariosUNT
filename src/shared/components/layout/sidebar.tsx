'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { cn } from '../../lib/utils';
import { 
  CalendarDays, 
  Users, 
  BookOpen, 
  Building2, 
  Clock, 
  BarChart
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      title: 'Dashboard',
      href: `/${role}`,
      icon: <BarChart className="w-5 h-5" />,
      roles: ['director', 'secretaria', 'docente'],
    },
    {
      title: 'Períodos',
      href: '/director/periodos',
      icon: <CalendarDays className="w-5 h-5" />,
      roles: ['director'],
    },
    {
      title: 'Docentes',
      href: '/dashboard/docentes',
      icon: <Users className="w-5 h-5" />,
      roles: ['director', 'secretaria'],
    },
    {
      title: 'Disponibilidad',
      href: '/dashboard/disponibilidad',
      icon: <Clock className="w-5 h-5" />,
      roles: ['director', 'docente'],
    },
    {
      title: 'Cursos',
      href: '/dashboard/cursos',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['director', 'secretaria'],
    },
    {
      title: 'Aulas',
      href: '/dashboard/aulas',
      icon: <Building2 className="w-5 h-5" />,
      roles: ['director', 'secretaria'],
    },
    {
      title: 'Horarios',
      href: '/dashboard/horarios',
      icon: <CalendarDays className="w-5 h-5" />,
      roles: ['director', 'secretaria', 'docente'],
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">Horarios UNT</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <span className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}>
                    {item.icon}
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </aside>
  );
}
