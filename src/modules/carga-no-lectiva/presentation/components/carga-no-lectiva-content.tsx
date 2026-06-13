'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, Save, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
    cursos: Array<{ codigo: string; nombre: string; horas: number }>;
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
            Registra tu carga horaria: carga electiva (cursos asignados) y carga no lectiva.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Periodo</p>
          <p className="text-base font-semibold text-foreground">{data?.periodoName}</p>
        </div>
      </div>

      {data?.docente && (
        <div className="rounded-2xl border border-border bg-slate-50 px-4 py-4 text-sm text-foreground">
          <p className="font-semibold text-foreground">Información de carga horaria</p>
          <p className="mt-2">Carga máxima: <span className="font-semibold">{data.docente.cargaMaxima} horas</span></p>
          <p className="mt-1">Carga electiva: <span className="font-semibold">{data.docente.cargaElectiva} horas</span></p>
          <p className="mt-1">Disponible para carga no lectiva: <span className="font-semibold text-primary">{Math.max(0, data.docente.cargaMaxima - data.docente.cargaElectiva)} horas</span></p>
          {data.docente.cursos && data.docente.cursos.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-foreground mb-2">Cursos Asignados:</p>
              <div className="space-y-1">
                {data.docente.cursos.map((curso, idx) => (
                  <p key={idx} className="text-muted-foreground">• {curso.codigo} - {curso.nombre} ({curso.horas}h)</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {data?.carga && (
        <div className="rounded-2xl border border-border bg-slate-50 px-4 py-4 text-sm text-foreground">
          <p className="font-semibold text-foreground">Estado actual</p>
          <p className="mt-2">Total no lectivo: <span className="font-semibold">{data.carga.totalHoras} horas</span></p>
          <p className="mt-1">Situación: <span className="font-medium">{data.carga.estado}</span></p>
          <p className="mt-1">Director: <span className={data.carga.directorAprobado ? 'text-emerald-700' : 'text-muted-foreground'}>{data.carga.directorAprobado ? 'Aprobado' : 'Pendiente'}</span></p>
          <p className="mt-1">Secretaria: <span className={data.carga.secretariaAprobado ? 'text-emerald-700' : 'text-muted-foreground'}>{data.carga.secretariaAprobado ? 'Aprobado' : 'Pendiente'}</span></p>
        </div>
      )}

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
  );
}
