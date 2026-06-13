'use client';

import { NotificacionesList } from './notificaciones-list';
import { Notificacion } from '../../domain/entities/notificacion.entity';
import { getNotificacionesAction } from '../actions/get-notificaciones.action';
import { useEffect, useState, startTransition } from 'react';
import { AlertCircle, Bell } from 'lucide-react';

export function NotificacionesContent() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = () => {
    setLoading(true);
    setError(null);
    startTransition(async () => {
      const res = await getNotificacionesAction();
      if (res.message) {
        setError(res.message);
        setNotificaciones([]);
      } else if (res.data) {
        setNotificaciones(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Notificaciones</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando notificaciones...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg border border-destructive/20">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      ) : (
        <NotificacionesList
          notificaciones={notificaciones}
          onRefresh={fetchNotificaciones}
        />
      )}
    </div>
  );
}
