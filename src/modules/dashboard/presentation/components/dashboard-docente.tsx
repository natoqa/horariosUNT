'use client';

import { useEffect, useState, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Clock, Calendar, CheckCircle2, AlertCircle, Bell, BookOpen, TrendingUp } from 'lucide-react';
import { getDashboardDocenteAction } from '../actions/get-dashboard-docente.action';
import { DashboardDocenteDTO } from '../../application/dtos/dashboard.dto';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';

export function DashboardDocente() {
  const [dashboard, setDashboard] = useState<DashboardDocenteDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = () => {
      setLoading(true);
      setError(null);
      startTransition(async () => {
        const res = await getDashboardDocenteAction();
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
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboard) {
    return null;
  }

  const cargaPorcentaje = dashboard.cargaMaxima > 0
    ? (dashboard.cargaAsignada / dashboard.cargaMaxima) * 100
    : 0;

  const getAsignacionForCell = (dia: string, bloque: string) => {
    return dashboard.horarioSemanal.find(
      (a) => a.dia === dia && a.bloque === bloque
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground">Información de mi horario y disponibilidad</p>
      </div>

      {/* Estado de disponibilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Estado de Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {dashboard.estadoDisponibilidad === 'registrada' ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Registrada
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                <AlertCircle className="w-3 h-3 mr-1" />
                Pendiente
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Carga asignada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Carga Asignada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{dashboard.cargaAsignada}</span>
              <span className="text-muted-foreground mb-1">/ {dashboard.cargaMaxima} horas</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  cargaPorcentaje > 90
                    ? 'bg-red-500'
                    : cargaPorcentaje > 70
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(cargaPorcentaje, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {cargaPorcentaje.toFixed(0)}% de carga asignada
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Carga Horaria Detallada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Carga Horaria Detallada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Carga Electiva (Cursos)</p>
                <p className="text-2xl font-bold text-emerald-600">{dashboard.cargaHoraria.cargaElectiva}h</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Carga No Lectiva</p>
                <p className="text-2xl font-bold text-purple-600">{dashboard.cargaHoraria.cargaNoLectiva}h</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Carga Total</p>
                <p className="text-2xl font-bold">{dashboard.cargaHoraria.cargaTotal}h</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Disponible No Lectiva</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard.cargaHoraria.horasDisponiblesNoLectivas}h</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Estado de Aprobación</p>
                <Badge variant={dashboard.cargaHoraria.directorAprobado && dashboard.cargaHoraria.secretariaAprobado ? 'default' : 'outline'}>
                  {dashboard.cargaHoraria.directorAprobado && dashboard.cargaHoraria.secretariaAprobado ? 'Aprobado' : dashboard.cargaHoraria.estadoAprobacion}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursos Asignados */}
      {dashboard.cursosAsignados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.cursosAsignados.map((curso, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{curso.codigo} - {curso.nombre}</p>
                    <p className="text-xs text-muted-foreground">Ciclo {curso.ciclo} • Grupo {curso.grupo}</p>
                  </div>
                  <Badge variant="outline">{curso.horas}h</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notificaciones */}
      {dashboard.notificaciones > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-600">Tienes {dashboard.notificaciones} notificaciones pendientes.</p>
          </CardContent>
        </Card>
      )}

      {/* Horario semanal */}
      {dashboard.horarioSemanal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horario Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium text-muted-foreground border-r border-border min-w-[120px]">
                      Bloque
                    </th>
                    {DIAS_SEMANA.map((dia) => (
                      <th
                        key={dia}
                        className="h-12 px-4 text-center font-medium text-muted-foreground border-r border-border min-w-[140px]"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BLOQUES_HORARIOS.map((bloque) => (
                    <tr key={bloque} className="border-t border-border">
                      <td className="h-20 px-4 font-medium text-xs text-muted-foreground border-r border-border">
                        {bloque}
                      </td>
                      {DIAS_SEMANA.map((dia) => {
                        const asignacion = getAsignacionForCell(dia, bloque);
                        return (
                          <td
                            key={`${dia}-${bloque}`}
                            className="h-20 px-2 border-r border-border last:border-r-0 bg-muted/30"
                          >
                            {asignacion ? (
                              <div className="p-2 rounded bg-card border border-border h-full">
                                <div className="font-semibold text-xs text-foreground truncate">
                                  {asignacion.curso}
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                  {asignacion.aula}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-muted-foreground/30">
                                -
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
