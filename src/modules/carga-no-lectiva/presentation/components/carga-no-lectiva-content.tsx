'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, Save, AlertCircle, Download, Plus, Calendar, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/hooks/use-auth';
import { getCargaNoLectivaAction } from '../actions/get-carga-no-lectiva.action';
import { saveActividadesCargaNoLectivaAction } from '../actions/save-actividades-carga-no-lectiva.action';
import { saveCargaNoLectivaAction } from '../actions/save-carga-no-lectiva.action';
import { saveCargaLectivaDeclaracionAction } from '../actions/save-carga-lectiva-declaracion.action';
import { generateCargaNoLectivaPdfAction } from '../actions/generate-carga-no-lectiva-pdf.action';
import {
  ACTIVIDADES_NO_LECTIVAS,
  ACTIVIDADES_NO_LECTIVAS_INSTRUCTIONS,
  ActividadNoLectivaTipo,
} from '../../domain/entities/carga-no-lectiva.entity';
import { useRouter } from 'next/navigation';

interface ActividadFormRow {
  tipo: ActividadNoLectivaTipo;
  horas: number;
  detalles: string;
}

interface CargaNoLectivaData {
  periodoId: string;
  periodoName: string;
  actividades: ActividadFormRow[];
  docente?: {
    cargaMaxima: number;
    cargaElectiva: number;
    cursos: Array<{ codigo: string; nombre: string; horas: number; ciclo: string; tipo: string }>;
  };
  carga: {
    id: string;
    totalHoras: number;
    estado: string;
    directorAprobado: boolean;
    secretariaAprobado: boolean;
    horasLectivasAsignadas: number;
    horasLectivasNoAsignadas: number;
    lectivaDeclarada: boolean;
    declaracionLectiva: string;
  } | null;
}

export function CargaNoLectivaContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<CargaNoLectivaData | null>(null);
  const [actividades, setActividades] = useState<ActividadFormRow[]>(
    ACTIVIDADES_NO_LECTIVAS.map((tipo) => ({ tipo, horas: 0, detalles: '' })),
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const [activitiesState, activitiesAction, savingActivities] = useActionState<any, FormData>(saveActividadesCargaNoLectivaAction, undefined);
  const [lectivaState, lectivaAction, savingLectiva] = useActionState<any, FormData>(saveCargaLectivaDeclaracionAction, undefined);
  const [totalState, totalAction, savingTotal] = useActionState<any, FormData>(saveCargaNoLectivaAction, undefined);

  const [horasLectivasNoAsignadas, setHorasLectivasNoAsignadas] = useState(0);
  const [declaracionLectiva, setDeclaracionLectiva] = useState('');
  const [lectivaDeclarada, setLectivaDeclarada] = useState(false);

  const totalHoras = useMemo(() => {
    const actividadHoras = actividades.reduce((sum, actividad) => sum + Number(actividad.horas), 0);
    return (
      actividadHoras +
      (data?.carga?.horasLectivasAsignadas ?? 0) +
      horasLectivasNoAsignadas
    );
  }, [actividades, data?.carga?.horasLectivasAsignadas, horasLectivasNoAsignadas]);

  const horasDisponiblesNoLectivas = data?.docente 
    ? Math.max(0, data.docente.cargaMaxima - data.docente.cargaElectiva)
    : 0;

  const actividadHoras = useMemo(() => {
    return actividades.reduce((sum, actividad) => sum + Number(actividad.horas), 0);
  }, [actividades]);

  const totalActividadesGuardadas = useMemo(() => {
    if (!data?.actividades) return 0;
    return data.actividades.reduce((sum, actividad) => sum + Number(actividad.horas), 0);
  }, [data?.actividades]);

  // Calculate remaining hours for each activity
  const getRemainingHours = (currentIndex: number) => {
    const totalUsed = actividades.reduce((sum, actividad, idx) => {
      if (idx === currentIndex) return sum; // Exclude current activity
      return sum + Number(actividad.horas);
    }, 0);
    return Math.max(0, horasDisponiblesNoLectivas - totalUsed);
  };

  const horasValidation = useMemo(() => {
    const totalNoLectivas = actividadHoras;
    if (totalNoLectivas > horasDisponiblesNoLectivas) {
      return {
        type: 'error' as const,
        message: `Has excedido las horas disponibles para carga no lectiva. Máximo: ${horasDisponiblesNoLectivas}h, Actual: ${totalNoLectivas}h`,
      };
    }
    if (totalNoLectivas < horasDisponiblesNoLectivas) {
      return {
        type: 'warning' as const,
        message: `Faltan ${horasDisponiblesNoLectivas - totalNoLectivas} horas para completar la carga no lectiva requerida (${horasDisponiblesNoLectivas}h).`,
      };
    }
    return {
      type: 'success' as const,
      message: 'Has completado exactamente las horas requeridas para carga no lectiva.',
    };
  }, [actividadHoras, horasDisponiblesNoLectivas]);

  const allActivitiesRegistered = actividades.every((actividad) => actividad.detalles.trim().length > 0);
  const isApproved = data?.carga?.estado === 'Aprobado';
  const canRegisterTotal = allActivitiesRegistered && totalHoras > 0 && lectivaDeclarada && !isApproved;

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getCargaNoLectivaAction();
      if (result.message) {
        setErrorMessage(result.message);
        return;
      }

      if (result.data) {
        const currentMap = new Map(result.data.actividades.map((actividad) => [actividad.tipo, actividad]));
        const loadedActividades = ACTIVIDADES_NO_LECTIVAS.map((tipo) =>
          currentMap.get(tipo) ?? { tipo, horas: 0, detalles: '' },
        );
        setData({
          periodoId: result.data.periodoId,
          periodoName: result.data.periodoName,
          actividades: loadedActividades,
          docente: result.data.docente,
          carga: result.data.carga
            ? {
                id: result.data.carga.id,
                totalHoras: result.data.carga.totalHoras,
                estado: result.data.carga.estado,
                directorAprobado: result.data.carga.directorAprobado,
                secretariaAprobado: result.data.carga.secretariaAprobado,
                horasLectivasAsignadas: result.data.carga.horasLectivasAsignadas,
                horasLectivasNoAsignadas: result.data.carga.horasLectivasNoAsignadas,
                lectivaDeclarada: result.data.carga.lectivaDeclarada,
                declaracionLectiva: result.data.carga.declaracionLectiva,
              }
            : null,
        });
        setActividades(loadedActividades);
        setHorasLectivasNoAsignadas(result.data.carga?.horasLectivasNoAsignadas ?? 0);
        setDeclaracionLectiva(result.data.carga?.declaracionLectiva ?? '');
        setLectivaDeclarada(result.data.carga?.lectivaDeclarada ?? false);
      }
    } catch (error) {
      setErrorMessage('Error al cargar la declaración de carga no lectiva.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  useEffect(() => {
    if (activitiesState?.success || totalState?.success) {
      loadData();
    }
  }, [activitiesState?.success, totalState?.success]);

  const updateActividad = (index: number, field: 'horas' | 'detalles', value: string) => {
    setActividades((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [field]: field === 'horas' ? Number(value) : value,
      };
      return next;
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando declaración de carga no lectiva...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">Debe iniciar sesión para acceder a esta sección.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      </div>
    );
  }

  const tieneGruposAsignados = data?.docente?.cursos && data.docente.cursos.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carga Horaria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === 'docente'
              ? 'Gestiona tu carga horaria: carga lectiva y no lectiva'
              : 'Registra tu carga horaria: carga electiva (cursos asignados) y carga no lectiva.'
            }
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Periodo</p>
          <p className="text-base font-semibold text-foreground">{data?.periodoName}</p>
        </div>
      </div>

      {!tieneGruposAsignados ? (
        <div className="rounded-2xl border border-border bg-gradient-to-r from-blue-50 to-white p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tienes grupos asignados</h3>
          <p className="text-muted-foreground">
            No necesitas registrar tu carga horaria este período porque no tienes cursos asignados.
          </p>
        </div>
      ) : (
        <>
          {data?.carga && (
            <div className="rounded-2xl border border-border bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Estado de Aprobación</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${data.carga.directorAprobado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">Director</p>
                        <p className="text-xs text-muted-foreground">{data.carga.directorAprobado ? 'Aprobado' : 'Pendiente de aprobación'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${data.carga.secretariaAprobado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">Secretaria</p>
                        <p className="text-xs text-muted-foreground">{data.carga.secretariaAprobado ? 'Aprobado' : 'Pendiente de aprobación'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    data.carga.estado === 'Aprobado'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : data.carga.estado === 'En revisión'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {data.carga.estado}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Total: {data.carga.totalHoras} horas</p>
                </div>
              </div>
            </div>
          )}

          {data?.docente && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-white px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Carga Lectiva</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Carga máxima</span>
                    <span className="text-sm font-semibold text-foreground">{data.docente.cargaMaxima} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cursos asignados</span>
                    <span className="text-sm font-semibold text-emerald-700">{data.docente.cargaElectiva} h</span>
                  </div>
                  {data.docente.cursos && data.docente.cursos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Cursos asignados:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data.docente.cursos.map((curso, idx) => (
                          <div key={idx} className="rounded-lg bg-white p-2 text-xs border border-border">
                            <p className="font-medium text-foreground">{curso.codigo} - {curso.nombre}</p>
                            <div className="mt-1 flex gap-3 text-muted-foreground">
                              <span>Ciclo: {curso.ciclo}</span>
                              <span>Tipo: {curso.tipo}</span>
                              <span>Horas: {curso.horas}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-br from-purple-50 to-white px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Carga No Lectiva</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Disponible</span>
                    <span className="text-sm font-semibold text-primary">{horasDisponiblesNoLectivas} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Registrado</span>
                    <span className="text-sm font-semibold text-purple-700">{totalActividadesGuardadas} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pendiente</span>
                    <span className="text-sm font-semibold text-amber-700">{Math.max(0, horasDisponiblesNoLectivas - totalActividadesGuardadas)} h</span>
                  </div>
                </div>
                {data.actividades && data.actividades.length > 0 && data.actividades.some(a => a.horas > 0 || a.detalles) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Actividades registradas:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {data.actividades.filter(a => a.horas > 0 || a.detalles).map((actividad, idx) => (
                        <div key={idx} className="rounded-lg bg-white p-2 text-xs border border-border">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-foreground">{actividad.tipo}</p>
                            <span className="text-purple-700 font-semibold">{actividad.horas}h</span>
                          </div>
                          {actividad.detalles && (
                            <p className="mt-1 text-muted-foreground">{actividad.detalles}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user?.role === 'docente' && (
            <div className="flex justify-end">
              <Button onClick={() => setDialogOpen(true)} size="sm">
                {data?.carga ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Editar Carga Horaria
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Carga Horaria
                  </>
                )}
              </Button>
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{data?.carga ? 'Editar Carga Horaria' : 'Registrar Carga Horaria'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <form action={activitiesAction} className="space-y-4">
                  <input type="hidden" name="periodoId" value={data?.periodoId ?? ''} />

                  {ACTIVIDADES_NO_LECTIVAS.map((tipo, index) => (
                    <div key={tipo} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">{tipo}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{ACTIVIDADES_NO_LECTIVAS_INSTRUCTIONS[tipo]}</p>
                        </div>
                        <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Actividad {index + 1} de {ACTIVIDADES_NO_LECTIVAS.length}</div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[120px_1fr]">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Horas semanales</Label>
                          <div className="relative">
                            <Input
                              name="horas"
                              type="number"
                              min={0}
                              max={getRemainingHours(index)}
                              value={actividades[index]?.horas ?? 0}
                              onChange={(event) => updateActividad(index, 'horas', event.target.value)}
                              className="h-10 pr-16"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {actividades[index]?.horas ?? 0}/{getRemainingHours(index)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Detalle</Label>
                          <Textarea
                            name="detalles"
                            value={actividades[index]?.detalles ?? ''}
                            onChange={(event) => updateActividad(index, 'detalles', event.target.value)}
                            className="min-h-[112px]"
                            placeholder="Describe la actividad detalladamente. Si no aplica, escribe 'No aplica'."
                          />
                        </div>
                      </div>
                      <input type="hidden" name="tipo" value={tipo} />
                    </div>
                  ))}

                  {activitiesState?.message && (
                    <div className={`rounded-md px-4 py-3 ${activitiesState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
                      {activitiesState.message}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Debes registrar todas las actividades y sus detalles antes de registrar la carga total.
                    </div>
                    <Button type="submit" disabled={savingActivities} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      {savingActivities ? 'Guardando...' : 'Guardar actividades'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
