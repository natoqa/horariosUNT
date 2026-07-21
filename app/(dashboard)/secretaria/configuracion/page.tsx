'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, User, Globe, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/shared/hooks/use-auth';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    language: 'es',
    timezone: 'America/Lima',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu cuenta y preferencias del sistema
        </p>
      </div>

      {/* Información de Perfil */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Información de Perfil</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                value={user?.email || ''}
                placeholder="tu@unitru.edu.pe"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notificaciones del sistema</p>
              <p className="text-xs text-muted-foreground">Recibir alertas sobre cambios importantes</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`w-11 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${
                  settings.notifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Alertas por correo</p>
              <p className="text-xs text-muted-foreground">Recibir notificaciones por email</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
              className={`w-11 h-6 rounded-full transition-colors ${
                settings.emailAlerts ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${
                  settings.emailAlerts ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferencias del Sistema */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Preferencias del Sistema</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Zona Horaria</Label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="America/Lima">Lima (Perú)</option>
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/Bogota">Bogotá</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Seguridad</h2>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Cambiar Contraseña
          </Button>
          <Button variant="outline" className="w-full">
            Ver Historial de Sesiones
          </Button>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
