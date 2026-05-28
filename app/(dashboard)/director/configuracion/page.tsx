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
          Gestiona la configuración de tu cuenta y preferencias del sistema.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Información de Perfil */}
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Información de Perfil</h2>
              <p className="text-xs text-muted-foreground">Datos personales de tu cuenta</p>
            </div>
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
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
              <p className="text-xs text-muted-foreground">Configura las alertas del sistema</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Notificaciones del sistema</p>
                <p className="text-xs text-muted-foreground">Recibir alertas de cambios importantes</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-11 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
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
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferencias del Sistema */}
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Preferencias del Sistema</h2>
              <p className="text-xs text-muted-foreground">Configuración regional y de idioma</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm"
                >
                  <option value="America/Lima">Lima (UTC-5)</option>
                  <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                  <option value="America/Bogota">Bogotá (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Seguridad</h2>
              <p className="text-xs text-muted-foreground">Gestión de contraseña y acceso</p>
            </div>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Cambiar Contraseña
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ver Historial de Sesiones
            </Button>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
