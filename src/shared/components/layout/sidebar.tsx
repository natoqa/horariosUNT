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
  BarChart3,
  LogOut,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  MessageSquare,
  X,
} from 'lucide-react';
import { logoutAction } from '@/modules/auth/presentation/actions/logout.action';
import { useState, useEffect } from 'react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: { title: string; href: string; roles: string[] }[];
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Periodos']);

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  if (!user) return null;

  const role = user.role;

  const menuSections: MenuSection[] = [
    {
      label: 'GESTION ACADEMICA',
      items: [
        {
          title: 'Dashboard',
          href: `/${role}`,
          icon: BarChart3,
          roles: ['director', 'secretaria', 'docente'],
        },
        {
          title: 'Periodos',
          href: `/${role}/periodos`,
          icon: CalendarDays,
          roles: ['director', 'secretaria'],
          children: [
            { title: 'Todos los periodos', href: `/${role}/periodos`, roles: ['director', 'secretaria'] },
          ],
        },
        {
          title: 'Docentes',
          href: `/${role}/docentes`,
          icon: Users,
          roles: ['director', 'secretaria'],
          children: [
            { title: 'Ver Docentes', href: `/${role}/docentes`, roles: ['director', 'secretaria'] },
            { title: 'Crear Docente', href: `/${role}/docentes/crear`, roles: ['director', 'secretaria'] },
          ],
        },
        {
          title: 'Cursos',
          href: `/${role}/cursos`,
          icon: BookOpen,
          roles: ['director', 'secretaria'],
        },
        {
          title: 'Planes de Estudio',
          href: `/${role}/planes-estudio`,
          icon: FileText,
          roles: ['director', 'secretaria'],
        },
        {
          title: 'Aulas',
          href: `/${role}/aulas`,
          icon: Building2,
          roles: ['director', 'secretaria'],
        },
      ],
    },
    {
      label: 'PLANIFICACION',
      items: [
        {
          title: 'Disponibilidad',
          href: `/${role}/disponibilidad`,
          icon: Clock,
          roles: ['docente'],
        },
        {
          title: 'Horarios',
          href: `/${role}/horarios`,
          icon: CalendarDays,
          roles: ['director', 'secretaria', 'docente'],
        },
        {
          title: 'Carga horaria',
          href: `/${role}/carga-no-lectiva`,
          icon: FileText,
          roles: ['director', 'secretaria', 'docente'],
        },
        {
          title: 'Reportes',
          href: `/${role}/reportes`,
          icon: FileText,
          roles: ['director', 'secretaria'],
        },
      ],
    },
    {
      label: 'SOPORTE',
      items: [
        {
          title: 'Comentarios',
          href: `/${role}/comentarios`,
          icon: MessageSquare,
          roles: ['director', 'secretaria', 'docente'],
        },
        {
          title: 'Ayuda',
          href: `/${role}/ayuda`,
          icon: HelpCircle,
          roles: ['director', 'secretaria', 'docente'],
        },
        {
          title: 'Configuracion',
          href: `/${role}/configuracion`,
          icon: Settings,
          roles: ['director', 'secretaria'],
        },
      ],
    },
  ];

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const getInitials = () => {
    if (user.fullName) {
      const parts = user.fullName.split(' ');
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'US';
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-[var(--sidebar-border)]">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground tracking-tight">Horarios UNT</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors lg:hidden"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1 rounded-md hover:bg-muted transition-colors hidden lg:block">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 border border-border/60">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Buscar...</span>
          <div className="ml-auto items-center gap-0.5 hidden lg:flex">
            <kbd className="h-5 px-1.5 rounded bg-white border border-border text-[10px] font-medium text-muted-foreground flex items-center">⌘</kbd>
            <kbd className="h-5 px-1.5 rounded bg-white border border-border text-[10px] font-medium text-muted-foreground flex items-center">K</kbd>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {menuSections.map((section) => {
          const filteredItems = section.items.filter(item => item.roles.includes(role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {filteredItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const isExpanded = expandedItems.includes(item.title);
                  const hasChildren = item.children && item.children.length > 0;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <div className="flex items-center">
                        <Link href={hasChildren ? '#' : item.href} className="flex-1"
                          onClick={hasChildren ? (e) => { e.preventDefault(); toggleExpand(item.title); } : undefined}
                        >
                          <span className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                            isActive && !hasChildren
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}>
                            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                            <span className="flex-1">{item.title}</span>
                            {hasChildren && (
                              isExpanded
                                ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                                : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </span>
                        </Link>
                      </div>
                      {hasChildren && isExpanded && (
                        <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-border pl-3">
                          {item.children!.filter(c => c.roles.includes(role)).map(child => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link href={child.href}>
                                  <span className={cn(
                                    "block px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    childActive
                                      ? "text-foreground bg-muted"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  )}>
                                    {child.title}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{user.fullName || user.email}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => logoutAction()}
            className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
            title="Cerrar sesion"
          >
            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — desktop: fixed, mobile: slide-in overlay */}
      <aside
        className={cn(
          "w-64 h-screen bg-white border-r border-[var(--sidebar-border)] flex flex-col fixed left-0 top-0 z-40 transition-transform duration-200 ease-in-out",
          "lg:translate-x-0 lg:z-20",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
