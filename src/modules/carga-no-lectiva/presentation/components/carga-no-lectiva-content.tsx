'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, Save, AlertCircle, Download, Plus } from 'lucide-react';
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
                <span className="text-sm font-semibold text-primary">{Math.max(0, data.docente.cargaMaxima - data.docente.cargaElectiva)} h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Registrado</span>
                <span className="text-sm font-semibold text-purple-700">{data.carga?.totalHoras || 0} h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pendiente</span>
                <span className="text-sm font-semibold text-amber-700">{Math.max(0, (data.docente.cargaMaxima - data.docente.cargaElectiva) - (data.carga?.totalHoras || 0))} h</span>
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

      {user?.role !== 'docente' && (
        <>
          <form action={lectivaAction} className="space-y-4 rounded-3xl border border-border bg-white p-5 shadow-sm">
            <input type="hidden" name="periodoId" value={data?.periodoId ?? ''} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-foreground">Carga lectiva asignada</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{data?.carga?.horasLectivasAsignadas ?? 0} h</p>
                <p className="mt-1 text-xs text-muted-foreground">Esta carga es asignada por Secretaría o Dirección.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Horas lectivas no asignadas</Label>
                    <Input
                      name="horasLectivasNoAsignadas"
                      type="number"
                      min={0}
                      value={horasLectivasNoAsignadas}
                      onChange={(event) => setHorasLectivasNoAsignadas(Number(event.target.value))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Declaración lectiva</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        id="lectivaDeclarada"
                        name="lectivaDeclarada"
                        type="checkbox"
                        checked={lectivaDeclarada}
                        onChange={(event) => setLectivaDeclarada(event.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="lectivaDeclarada" className="text-sm text-foreground">
                        Declaro que la carga lectiva fue registrada en Dirección de escuela.
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Detalle de la declaración lectiva</Label>
                  <Textarea
                    name="declaracionLectiva"
                    value={declaracionLectiva}
                    onChange={(event) => setDeclaracionLectiva(event.target.value)}
                    className="min-h-[112px]"
                    placeholder="Número de resolución, observaciones o datos de la declaración lectiva."
                  />
                </div>
              </div>
            </div>

            {lectivaState?.message && (
              <div className={`rounded-md px-4 py-3 ${lectivaState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
                {lectivaState.message}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Guarda la declaración lectiva para poder registrar la carga total correctamente.
              </div>
              <Button type="submit" disabled={savingLectiva} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {savingLectiva ? 'Guardando...' : 'Guardar declaración lectiva'}
              </Button>
            </div>
          </form>

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
                    <Input
                      name="horas"
                      type="number"
                      min={0}
                      value={actividades[index]?.horas ?? 0}
                      onChange={(event) => updateActividad(index, 'horas', event.target.value)}
                      className="h-10"
                    />
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

          <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Resumen de carga no lectiva</h2>
                <p className="text-sm text-muted-foreground mt-1">La carga total se calcula a partir de las actividades registradas.</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-foreground">Total: {totalHoras} horas</div>
            </div>

            {horasValidation.type !== 'success' && (
              <div className={`mt-4 rounded-md px-4 py-3 ${
                horasValidation.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">{horasValidation.message}</p>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actividades completas</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{actividades.filter((actividad) => actividad.detalles.trim().length > 0).length}/{ACTIVIDADES_NO_LECTIVAS.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Validación</p>
                <p className="mt-2 text-sm text-foreground">
                  {allActivitiesRegistered ? 'Todas las actividades tienen detalles registrados.' : 'Falta completar detalles en una o más actividades.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Puedes descargar el formato de declaración en PDF para tu registro personal.
              </div>
              <Button type="button" onClick={async () => {
                const formData = new FormData();
                formData.append('periodoId', data?.periodoId ?? '');
                const result = await generateCargaNoLectivaPdfAction(formData);
                if (result.pdfBase64 && result.fileName) {
                  const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
                  const blob = new Blob([bytes], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = result.fileName;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              }} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar formato PDF
              </Button>
            </div>

            <form action={totalAction} className="mt-6 space-y-4">
              <input type="hidden" name="periodoId" value={data?.periodoId ?? ''} />
              <input type="hidden" name="totalHoras" value={totalHoras} />

              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Cuando todas las actividades estén registradas, puedes enviar la carga total para aprobación de director y secretaria.</span>
                </div>
              </div>

              {totalState?.message && (
                <div className={`rounded-md px-4 py-3 ${totalState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
                  {totalState.message}
                </div>
              )}

              <Button type="submit" disabled={!canRegisterTotal || savingTotal} size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isApproved ? 'Carga aprobada' : savingTotal ? 'Enviando...' : 'Registrar carga no lectiva total'}
              </Button>
            </form>
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{data?.carga ? 'Editar Carga Horaria' : 'Registrar Carga Horaria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <form action={lectivaAction} className="space-y-4 rounded-3xl border border-border bg-white p-5 shadow-sm">
              <input type="hidden" name="periodoId" value={data?.periodoId ?? ''} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-foreground">Carga lectiva asignada</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{data?.carga?.horasLectivasAsignadas ?? 0} h</p>
                  <p className="mt-1 text-xs text-muted-foreground">Esta carga es asignada por Secretaría o Dirección.</p>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Horas lectivas no asignadas</Label>
                      <Input
                        name="horasLectivasNoAsignadas"
                        type="number"
                        min={0}
                        value={horasLectivasNoAsignadas}
                        onChange={(event) => setHorasLectivasNoAsignadas(Number(event.target.value))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Declaración lectiva</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="lectivaDeclarada"
                          name="lectivaDeclarada"
                          type="checkbox"
                          checked={lectivaDeclarada}
                          onChange={(event) => setLectivaDeclarada(event.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="lectivaDeclarada" className="text-sm text-foreground">
                          Declaro que la carga lectiva fue registrada en Dirección de escuela.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Detalle de la declaración lectiva</Label>
                    <Textarea
                      name="declaracionLectiva"
                      value={declaracionLectiva}
                      onChange={(event) => setDeclaracionLectiva(event.target.value)}
                      className="min-h-[112px]"
                      placeholder="Número de resolución, observaciones o datos de la declaración lectiva."
                    />
                  </div>
                </div>
              </div>

              {lectivaState?.message && (
                <div className={`rounded-md px-4 py-3 ${lectivaState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
                  {lectivaState.message}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Guarda la declaración lectiva para poder registrar la carga total correctamente.
                </div>
                <Button type="submit" disabled={savingLectiva} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  {savingLectiva ? 'Guardando...' : 'Guardar declaración lectiva'}
                </Button>
              </div>
            </form>

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
                      <Input
                        name="horas"
                        type="number"
                        min={0}
                        value={actividades[index]?.horas ?? 0}
                        onChange={(event) => updateActividad(index, 'horas', event.target.value)}
                        className="h-10"
                      />
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

            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Resumen de carga no lectiva</h2>
                  <p className="text-sm text-muted-foreground mt-1">La carga total se calcula a partir de las actividades registradas.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-foreground">Total: {totalHoras} horas</div>
              </div>

              {horasValidation.type !== 'success' && (
                <div className={`mt-4 rounded-md px-4 py-3 ${
                  horasValidation.type === 'error' 
                    ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <p className="text-sm">{horasValidation.message}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actividades completas</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{actividades.filter((actividad) => actividad.detalles.trim().length > 0).length}/{ACTIVIDADES_NO_LECTIVAS.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Validación</p>
                  <p className="mt-2 text-sm text-foreground">
                    {allActivitiesRegistered ? 'Todas las actividades tienen detalles registrados.' : 'Falta completar detalles en una o más actividades.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Puedes descargar el formato de declaración en PDF para tu registro personal.
                </div>
                <Button type="button" onClick={async () => {
                  const formData = new FormData();
                  formData.append('periodoId', data?.periodoId ?? '');
                  const result = await generateCargaNoLectivaPdfAction(formData);
                  if (result.pdfBase64 && result.fileName) {
                    const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = result.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar formato PDF
                </Button>
              </div>

              <form action={totalAction} className="mt-6 space-y-4">
                <input type="hidden" name="periodoId" value={data?.periodoId ?? ''} />
                <input type="hidden" name="totalHoras" value={totalHoras} />

                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Cuando todas las actividades estén registradas, puedes enviar la carga total para aprobación de director y secretaria.</span>
                  </div>
                </div>

                {totalState?.message && (
                  <div className={`rounded-md px-4 py-3 ${totalState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
                    {totalState.message}
                  </div>
                )}

                <Button type="submit" disabled={!canRegisterTotal || savingTotal} size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isApproved ? 'Carga aprobada' : savingTotal ? 'Enviando...' : 'Registrar carga no lectiva total'}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
