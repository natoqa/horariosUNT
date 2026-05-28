'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Lock, User, Globe, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/shared/hooks/use-auth';
import { getOwnDocenteInfoAction } from '@/modules/docentes/presentation/actions/get-own-docente-info.action';
import { Docente } from '@/modules/docentes/domain/entities/docente.entity';
import { calcularAntiguedad } from '@/modules/docentes/domain/entities/docente.entity';

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
  const [docenteInfo, setDocenteInfo] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocenteInfo = async () => {
      const result = await getOwnDocenteInfoAction();
      if (result.data) {
        setDocenteInfo(result.data);
      } else if (result.message) {
        setError(result.message);
      }
      setLoading(false);
    };

    if (user) {
      loadDocenteInfo();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando información...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu cuenta y preferencias del sistema
        </p>
      </div>

      {/* Información de Registro del Docente */}
      {docenteInfo && (
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Información de Registro</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Nombres</Label>
                <p className="text-sm text-foreground">{docenteInfo.nombres}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Apellidos</Label>
                <p className="text-sm text-foreground">{docenteInfo.apellidos}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
                <p className="text-sm text-foreground">{docenteInfo.dni}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Correo</Label>
                <p className="text-sm text-foreground">{docenteInfo.correo}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Teléfono</Label>
                <p className="text-sm text-foreground">{docenteInfo.telefono || 'No registrado'}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Categoría</Label>
                <p className="text-sm text-foreground">{docenteInfo.categoria}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Régimen</Label>
                <p className="text-sm text-foreground">{docenteInfo.regimen}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Condición</Label>
                <p className="text-sm text-foreground">{docenteInfo.condicion}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Escuela</Label>
                <p className="text-sm text-foreground">{docenteInfo.escuela}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Fecha de Ingreso</Label>
                <p className="text-sm text-foreground">{new Date(docenteInfo.fechaIngreso).toLocaleDateString('es-PE')}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Antigüedad</Label>
                <p className="text-sm text-foreground">{calcularAntiguedad(docenteInfo.fechaIngreso)} años</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Carga Máxima</Label>
                <p className="text-sm text-foreground">{docenteInfo.cargaMaxima} horas/semana</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
                <p className="text-sm text-foreground">{docenteInfo.estado}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Perfil */}
      <div className="rounded-xl border border-border bg-white p-6">
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
      <div className="rounded-xl border border-border bg-white p-6">
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
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
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
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.emailAlerts ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferencias del Sistema */}
      <div className="rounded-xl border border-border bg-white p-6">
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
              className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm"
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
              className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm"
            >
              <option value="America/Lima">Lima (Perú)</option>
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/Bogota">Bogotá</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="rounded-xl border border-border bg-white p-6">
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
