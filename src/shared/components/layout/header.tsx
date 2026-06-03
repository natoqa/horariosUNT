'use client'

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Bell, Settings, LayoutGrid, Menu, Moon, Sun, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

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

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Periodo Creado',
    message: 'El periodo 2026-I ha sido creado exitosamente',
    time: 'Hace 5 minutos',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Disponibilidad Pendiente',
    message: '3 docentes aún no han registrado su disponibilidad',
    time: 'Hace 1 hora',
  },
  {
    id: '3',
    type: 'info',
    title: 'Recordatorio',
    message: 'La fecha límite para disponibilidad es el 30 de mayo',
    time: 'Hace 2 horas',
  },
];

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg) => breadcrumbLabels[seg] || seg);
  const currentRole = segments[0] || '';

  const handleSettingsClick = () => {
    if (currentRole) {
      router.push(`/${currentRole}/configuracion`);
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    // Navegar a una página de notificaciones si existe
    // Por ahora solo cerramos el dropdown
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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
        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px] text-muted-foreground" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-muted-foreground" />
            )}
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            {mockNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 w-80 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                    </div>
                  ) : (
                    mockNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className="px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={handleViewAllNotifications}
                  >
                    Ver todas las notificaciones
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleSettingsClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors hidden md:block"
          title="Configuración"
        >
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
