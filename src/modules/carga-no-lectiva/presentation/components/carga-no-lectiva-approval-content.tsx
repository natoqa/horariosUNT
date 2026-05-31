'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';
import { getCargasNoLectivaAction } from '../actions/get-cargas-no-lectiva.action';
import { approveCargaNoLectivaAction } from '../actions/approve-carga-no-lectiva.action';
import { saveCargaLectivaAsignacionAction } from '../actions/save-carga-lectiva-asignacion.action';
import { useActionState } from 'react';
import { UserRole } from '@/shared/types/roles';

interface CargaRow {
  id: string;
  docenteNombre: string;
  docenteEmail?: string;
  totalHoras: number;
  estado: string;
  directorAprobado: boolean;
  secretariaAprobado: boolean;
  horasLectivasAsignadas?: number;
  lectivaDeclarada?: boolean;
  cargaId?: string;
}

interface DocenteRow {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
}

interface ApprovalContentProps {
  role: UserRole;
}

export function CargaNoLectivaApprovalContent({ role }: ApprovalContentProps) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cargas, setCargas] = useState<CargaRow[]>([]);
  const [docentes, setDocentes] = useState<DocenteRow[]>([]);
  const [periodoId, setPeriodoId] = useState<string>('');

  const [approvalState, approvalAction, approving] = useActionState(approveCargaNoLectivaAction as any, undefined as any);
  const [assignState, assignAction, assigning] = useActionState(saveCargaLectivaAsignacionAction as any, undefined as any);

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
        };
      });
    }
    return cargas;
  }, [role, docentes, cargas]);

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
    if (approvalState?.success || assignState?.success) {
      loadData();
    }
  }, [approvalState?.success, assignState?.success]);

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
          <h1 className="text-2xl font-bold tracking-tight">Aprobación de carga no lectiva</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Como {role}, revisa y aprueba las cargas no lectivas registradas por los docentes.
          </p>
        </div>
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
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Docente</th>
                <th className="px-4 py-3">Correo</th>
                {role === 'secretaria' && <th className="px-4 py-3">Horas lectivas asignadas</th>}
                <th className="px-4 py-3">Horas totales</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Director</th>
                <th className="px-4 py-3">Secretaria</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const alreadyApproved = role === 'director' ? row.directorAprobado : row.secretariaAprobado;
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-4 font-medium text-foreground">{row.docenteNombre || 'Sin nombre'}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.docenteEmail || '-'}</td>
                    {role === 'secretaria' && (
                      <td className="px-4 py-4">
                        <form action={assignAction} className="flex items-center gap-2">
                          <input type="hidden" name="periodoId" value={periodoId} />
                          <input type="hidden" name="docenteId" value={row.id} />
                          <input
                            type="number"
                            name="horasLectivasAsignadas"
                            defaultValue={row.horasLectivasAsignadas ?? 0}
                            min={0}
                            className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                          <Button type="submit" size="sm" disabled={assigning}>
                            Asignar
                          </Button>
                        </form>
                      </td>
                    )}
                    <td className="px-4 py-4">{row.totalHoras} h</td>
                    <td className="px-4 py-4">{row.estado}</td>
                    <td className="px-4 py-4">{row.directorAprobado ? '✅' : '—'}</td>
                    <td className="px-4 py-4">{row.secretariaAprobado ? '✅' : '—'}</td>
                    <td className="px-4 py-4">
                      <form action={approvalAction}>
                        <input type="hidden" name="cargaId" value={row.cargaId ?? ''} />
                        <Button type="submit" size="sm" disabled={approving || alreadyApproved || !row.cargaId}>
                          <Check className="mr-2 h-4 w-4" />
                          {row.cargaId ? (alreadyApproved ? 'Aprobado' : 'Aprobar') : 'Sin carga'}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    </div>
  );
}
