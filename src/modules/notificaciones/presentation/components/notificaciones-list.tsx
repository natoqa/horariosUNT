'use client';

import { Notificacion } from '../../domain/entities/notificacion.entity';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, Check, Clock, Calendar, Info, AlertTriangle } from 'lucide-react';
import { marcarLeidaAction } from '../actions/marcar-leida.action';
import { toast } from 'sonner';
import { startTransition } from 'react';

interface NotificacionesListProps {
  notificaciones: Notificacion[];
  onRefresh?: () => void;
}

export function NotificacionesList({
  notificaciones,
  onRefresh,
}: NotificacionesListProps) {
  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'apertura_recopilacion':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'recordatorio':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'publicacion_horario':
        return <Bell className="w-4 h-4 text-green-500" />;
      case 'alerta':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeColorForType = (tipo: string) => {
    switch (tipo) {
      case 'apertura_recopilacion':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'recordatorio':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'publicacion_horario':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'alerta':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await marcarLeidaAction(id);
      if (res.success) {
        toast.success('Notificación marcada como leída');
        onRefresh?.();
      } else if (res.message) {
        toast.error(res.message);
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await marcarLeidaAction();
      if (res.success) {
        toast.success('Todas las notificaciones marcadas como leídas');
        onRefresh?.();
      } else if (res.message) {
        toast.error(res.message);
      }
    });
  };

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  if (notificaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
        <p className="text-xs text-muted-foreground mt-1">
          No tienes notificaciones pendientes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notificaciones.map((notificacion) => (
          <Card
            key={notificacion.id}
            className={`p-4 transition-all ${
              !notificacion.leida
                ? 'bg-blue-500/10/50 border-blue-500/20'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIconForType(notificacion.tipo)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {notificacion.titulo}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getBadgeColorForType(notificacion.tipo)}`}
                      >
                        {notificacion.tipo.replace(/_/g, ' ')}
                      </Badge>
                      {!notificacion.leida && (
                        <Badge variant="default" className="text-xs">
                          Nueva
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notificacion.mensaje}
                    </p>
                  </div>
                  {!notificacion.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notificacion.id)}
                      className="shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(notificacion.createdAt).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
