'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Check, AlertCircle, Calendar, Clock, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/hooks/use-auth';
import { getCargasNoLectivaAction } from '../actions/get-cargas-no-lectiva.action';
import { approveCargaNoLectivaAction } from '../actions/approve-carga-no-lectiva.action';
import { saveCargaLectivaAsignacionAction } from '../actions/save-carga-lectiva-asignacion.action';
import { resetAllCargasNoLectivasAction } from '../actions/reset-all-cargas-no-lectivas.action';
import { useActionState } from 'react';
import { UserRole } from '@/shared/types/roles';
import { useRouter } from 'next/navigation';

interface CargaRow {
  id: string;
  docenteId?: string;
  docenteNombre: string;
  docenteEmail?: string;
  totalHoras: number;
  estado: string;
  directorAprobado: boolean;
  secretariaAprobado: boolean;
  horasLectivasAsignadas?: number;
  lectivaDeclarada?: boolean;
  cargaId?: string;
  cargaMaxima?: number;
  cargaElectiva?: number;
  horasDisponiblesNoLectivas?: number;
  cursos?: Array<{ codigo: string; nombre: string; horas: number }>;
  actividades?: Array<{ tipo: string; horas: number; detalles: string }>;
}

interface DocenteRow {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  cargaMaxima: number;
  cargaElectiva: number;
  cursos: Array<{ codigo: string; nombre: string; horas: number }>;
}

interface ApprovalContentProps {
  role: UserRole;
}

export function CargaNoLectivaApprovalContent({ role }: ApprovalContentProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cargas, setCargas] = useState<CargaRow[]>([]);
  const [docentes, setDocentes] = useState<DocenteRow[]>([]);
  const [periodoId, setPeriodoId] = useState<string>('');
  const [actividades, setActividades] = useState<Record<string, Array<{ tipo: string; horas: number; detalles: string }>>>({});

  const [approvalState, approvalAction, approving] = useActionState(approveCargaNoLectivaAction as any, undefined as any);
  const [assignState, assignAction, assigning] = useActionState(saveCargaLectivaAsignacionAction as any, undefined as any);
  const [resetState, resetAction, resetting] = useActionState(resetAllCargasNoLectivasAction as any, undefined as any);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const rows = useMemo(() => {
    if (role === 'secretaria') {
      const cargaMap = new Map(cargas.map((carga) => [carga.docenteEmail ?? '', carga]));
      return docentes.map((docente) => {
        const carga = cargaMap.get(docente.correo);
        return {
          id: docente.id,
          cargaId: carga?.id,
          docenteNombre: `${docente.nombres} ${docente.apellidos}`.trim(),
          docenteEmail: docente.correo,
          totalHoras: carga?.totalHoras ?? 0,
          estado: carga?.estado ?? 'Sin declarar',
          directorAprobado: carga?.directorAprobado ?? false,
          secretariaAprobado: carga?.secretariaAprobado ?? false,
          horasLectivasAsignadas: carga?.horasLectivasAsignadas ?? 0,
          lectivaDeclarada: carga?.lectivaDeclarada ?? false,
          cargaMaxima: docente.cargaMaxima,
          cargaElectiva: docente.cargaElectiva,
          cursos: docente.cursos,
          horasDisponiblesNoLectivas: Math.max(0, docente.cargaMaxima - docente.cargaElectiva),
          actividades: actividades[docente.id] || [],
        };
      });
    }
    return cargas.map((carga) => ({
      ...carga,
      id: carga.docenteId || carga.id, // Use docenteId for navigation
      actividades: (carga.docenteId && actividades[carga.docenteId]) || [],
    }));
  }, [role, docentes, cargas, actividades]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await getCargasNoLectivaAction();
      if (result.message) {
        setErrorMessage(result.message);
      } else if (result.data) {
        setCargas(result.data.cargas || []);
        setDocentes(result.data.docentes || []);
        setPeriodoId(result.data.periodoId ?? '');
        setActividades(result.data.actividades || {});
      }
    } catch (error) {
      setErrorMessage('Error al cargar las cargas no lectivas.');
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
    if (approvalState?.success || assignState?.success || resetState?.success) {
      loadData();
      setResetDialogOpen(false);
    }
  }, [approvalState?.success, assignState?.success, resetState?.success]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando solicitudes de aprobación...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carga Horaria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de carga horaria de los docentes: cursos asignados y carga no lectiva registrada.
          </p>
        </div>
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Resetear Todas las Cargas
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Estás seguro?</DialogTitle>
              <DialogDescription>
                Esto eliminará todas las cargas no lectivas y actividades registradas por los docentes en el período activo, incluso aquellas que ya han sido aprobadas. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)} disabled={resetting}>
                Cancelar
              </Button>
              <form action={resetAction}>
                <Button type="submit" variant="destructive" disabled={resetting}>
                  {resetting ? 'Reseteando...' : 'Resetear Todas las Cargas'}
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        </div>
      ) : (role !== 'secretaria' && cargas.length === 0) ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay cargas no lectivas para aprobar en este periodo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const alreadyApproved = role === 'director' ? row.directorAprobado : row.secretariaAprobado;
            return (
              <div key={row.id} className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{row.docenteNombre || 'Sin nombre'}</h3>
                      <p className="text-sm text-muted-foreground">{row.docenteEmail || '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.directorAprobado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Director: {row.directorAprobado ? 'Aprobado' : 'Pendiente'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.secretariaAprobado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Secretaria: {row.secretariaAprobado ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid gap-6 md:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Carga Horaria</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-muted-foreground">Carga Máxima</p>
                        <p className="text-lg font-semibold text-foreground">{row.cargaMaxima ?? 0} h</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="text-xs text-muted-foreground">Carga Electiva (Cursos)</p>
                        <p className="text-lg font-semibold text-emerald-700">{row.cargaElectiva ?? 0} h</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-xs text-muted-foreground">Disponible No Lectiva</p>
                        <p className="text-lg font-semibold text-primary">{row.horasDisponiblesNoLectivas ?? 0} h</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <p className="text-xs text-muted-foreground">Carga No Lectiva</p>
                        <p className="text-lg font-semibold text-purple-700">{row.totalHoras} h</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Cursos Asignados</h4>
                    {row.cursos && row.cursos.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {row.cursos.map((curso, idx) => (
                          <div key={idx} className="rounded-lg bg-slate-50 p-2 text-sm">
                            <p className="font-medium text-foreground">{curso.codigo} - {curso.nombre}</p>
                            <p className="text-xs text-muted-foreground">{curso.horas} horas</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin cursos asignados</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Actividades No Lectivas</h4>
                    {row.actividades && row.actividades.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {row.actividades.map((actividad: any, idx: number) => (
                          <div key={idx} className="rounded-lg bg-purple-50 p-2 text-sm">
                            <p className="font-medium text-foreground">{actividad.tipo}</p>
                            <p className="text-xs text-muted-foreground">{actividad.horas} horas - {actividad.detalles}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin actividades no lectivas registradas</p>
                    )}
                  </div>
                </div>

                <div className="p-5 border-t border-border bg-slate-50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Estado: <span className="font-medium text-foreground">{row.estado}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${role}/horario-grafico?docenteId=${row.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Horario Lectivas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${role}/horario-grafico?docenteId=${row.id}&viewMode=no-lectivas`)}
                        className="flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Horario No Lectivas
                      </Button>
                      <form action={approvalAction}>
                        <input type="hidden" name="cargaId" value={row.cargaId ?? ''} />
                        <Button type="submit" size="sm" disabled={approving || alreadyApproved || !row.cargaId}>
                          <Check className="mr-2 h-4 w-4" />
                          {row.cargaId ? (alreadyApproved ? 'Aprobado' : 'Aprobar') : 'Sin carga'}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {approvalState?.message && (
        <div className={`rounded-md px-4 py-3 ${approvalState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
          {approvalState.message}
        </div>
      )}
      {assignState?.message && (
        <div className={`rounded-md px-4 py-3 ${assignState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
          {assignState.message}
        </div>
      )}
      {resetState?.message && (
        <div className={`rounded-md px-4 py-3 ${resetState.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
          {resetState.message}
        </div>
      )}
    </div>
  );
}
