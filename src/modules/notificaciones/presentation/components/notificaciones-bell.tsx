'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useState, useEffect } from 'react';
import { Notificacion } from '../../domain/entities/notificacion.entity';
import { getNotificacionesAction } from '../actions/get-notificaciones.action';

interface NotificacionesBellProps {
  onClick?: () => void;
}

export function NotificacionesBell({ onClick }: NotificacionesBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const res = await getNotificacionesAction();
      if (res.data) {
        const unread = res.data.filter((n) => !n.leida).length;
        setUnreadCount(unread);
      }
    };

    fetchUnreadCount();
    // Poll cada 30 segundos para actualizaciones
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
