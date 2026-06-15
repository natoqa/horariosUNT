'use client';

import { useEffect, useState, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, BookOpen, Building2, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDashboardSecretariaAction } from '../actions/get-dashboard-secretaria.action';
import { DashboardSecretariaDTO } from '../../application/dtos/dashboard.dto';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function DashboardSecretaria() {
  const [dashboard, setDashboard] = useState<DashboardSecretariaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = () => {
      setLoading(true);
      setError(null);
      startTransition(async () => {
        const res = await getDashboardSecretariaAction();
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
        <AlertTitle>Error</AlertTitle>
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
        <h1 className="text-2xl font-bold">Dashboard de Secretaria</h1>
        <p className="text-muted-foreground">Gestión administrativa del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Docentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalDocentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.docentesActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalCursos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.cursosActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalAulas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.aulasActivas} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Total Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalGrupos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Secciones creadas
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

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Pendientes de Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Docentes sin carga registrada</span>
                <span className="font-semibold text-orange-600">{dashboard.docentesPendientesCarga}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Grupos sin docente asignado</span>
                <span className="font-semibold text-red-600">{dashboard.gruposSinDocente}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cargas aprobadas</span>
                <span className="font-semibold text-green-600">{dashboard.cargaHoraria.docentesConCargaAprobada}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cargas pendientes de aprobación</span>
                <span className="font-semibold text-orange-600">{dashboard.cargaHoraria.docentesConCargaRegistrada - dashboard.cargaHoraria.docentesConCargaAprobada}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen detallado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{dashboard.totalDocentes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activos</span>
                <span className="font-semibold text-green-600">{dashboard.docentesActivos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Inactivos</span>
                <span className="font-semibold text-red-600">
                  {dashboard.totalDocentes - dashboard.docentesActivos}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aulas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{dashboard.totalAulas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activas</span>
                <span className="font-semibold text-green-600">{dashboard.aulasActivas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Inactivas/Mantenimiento</span>
                <span className="font-semibold text-orange-600">
                  {dashboard.totalAulas - dashboard.aulasActivas}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
