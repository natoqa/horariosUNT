'use client';

import { useEffect, useState, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { AlertCircle, Users, Calendar, Clock, Building2, BookOpen, CheckCircle2, Bell, TrendingUp } from 'lucide-react';
import { getDashboardDirectorAction } from '../actions/get-dashboard-director.action';
import { DashboardDirectorDTO } from '../../application/dtos/dashboard.dto';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export function DashboardDirector() {
  const [dashboard, setDashboard] = useState<DashboardDirectorDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = () => {
      setLoading(true);
      setError(null);
      startTransition(async () => {
        const res = await getDashboardDirectorAction();
        if (res.message) {
          setError(res.message);
          setDashboard(null);
        } else if (res.data) {
          setDashboard(res.data);
        }
        setLoading(false);
      });
    };

    fetchDashboard();
  }, []);

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'configuracion':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'recopilacion':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'generacion':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'aprobado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'publicado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cerrado':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'configuracion':
        return 'Configuración';
      case 'recopilacion':
        return 'Recopilación';
      case 'generacion':
        return 'Generación';
      case 'aprobado':
        return 'Aprobado';
      case 'publicado':
        return 'Publicado';
      case 'cerrado':
        return 'Cerrado';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard del Director</h1>
        <p className="text-muted-foreground">Visión general del sistema de horarios</p>
      </div>

      {/* Estado del período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Estado del Período Académico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getEstadoBadgeColor(dashboard.estadoPeriodo)}>
              {getEstadoLabel(dashboard.estadoPeriodo)}
            </Badge>
          </div>
          {!dashboard.generacionHabilitada && (
            <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Generación de horarios deshabilitada: Faltan {dashboard.docentesPendientesGeneracion} docente(s) con carga aprobada
              </p>
            </div>
          )}
          {dashboard.generacionHabilitada && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Generación de horarios habilitada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      {dashboard.alertas.length > 0 && (
        <div className="space-y-2">
          {dashboard.alertas.map((alerta) => (
            <Alert
              key={alerta.id}
              variant={alerta.severidad === 'alta' ? 'destructive' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alerta.mensaje}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Disponibilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.porcentajeDisponibilidad.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.docentesConDisponibilidad} de {dashboard.totalDocentes} docentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Carga Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.cargaPromedio.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Min: {dashboard.cargaMinima}h • Max: {dashboard.cargaMaxima}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Ocupación de Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.ocupacionAulas.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Eficiencia en uso de espacios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.notificacionesPendientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pendientes de revisión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Carga Horaria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estadísticas de Carga Horaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Docentes con Carga Registrada</p>
              <p className="text-2xl font-bold">{dashboard.cargaHoraria.docentesConCargaRegistrada} / {dashboard.cargaHoraria.totalDocentes}</p>
              <p className="text-xs text-muted-foreground">{((dashboard.cargaHoraria.docentesConCargaRegistrada / dashboard.cargaHoraria.totalDocentes) * 100).toFixed(0)}% completado</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Carga Total Lectiva</p>
              <p className="text-2xl font-bold text-emerald-600">{dashboard.cargaHoraria.cargaTotalLectiva}h</p>
              <p className="text-xs text-muted-foreground">Horas de cursos asignados</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Carga Total No Lectiva</p>
              <p className="text-2xl font-bold text-purple-600">{dashboard.cargaHoraria.cargaTotalNoLectiva}h</p>
              <p className="text-xs text-muted-foreground">Actividades no lectivas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Docentes</p>
              <p className="text-2xl font-bold">{dashboard.totalDocentes}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Docentes con Disponibilidad</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {dashboard.docentesConDisponibilidad}
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Docentes Pendientes</p>
              <p className="text-2xl font-bold text-orange-500">
                {dashboard.totalDocentes - dashboard.docentesConDisponibilidad}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cargas Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboard.cargaHoraria.docentesConCargaAprobada}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
