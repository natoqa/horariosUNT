'use client';

import { useState, useEffect, useRef } from 'react';
import { Curso } from '../../domain/entities/curso.entity';
import { Grupo } from '../../domain/entities/grupo.entity';
import {
  getGruposAction,
  getActivePeriodoAction,
  addGrupoAction,
  removeGrupoAction,
  getDocentesForSelectAction,
  DocenteOption,
} from '../actions/manage-grupos.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { X, Trash2, ShieldAlert, Loader2, Plus } from 'lucide-react';

interface GrupoManagerProps {
  curso: Curso;
  onClose: () => void;
}

export function GrupoManager({ curso, onClose }: GrupoManagerProps) {
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [activePeriodName, setActivePeriodName] = useState<string>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Cargar período activo e inicializar grupos
  useEffect(() => {
    async function init() {
      setLoading(true);
      const periodRes = await getActivePeriodoAction();
      if (periodRes.message) {
        setError(periodRes.message);
        setLoading(false);
        return;
      }
      
      if (periodRes.id) {
        setActivePeriodId(periodRes.id);
        setActivePeriodName(periodRes.name || '');

        const [gruposRes, docentesRes] = await Promise.all([
          getGruposAction(curso.id, periodRes.id),
          getDocentesForSelectAction(),
        ]);
        if (gruposRes.data) {
          setGrupos(gruposRes.data);
        } else if (gruposRes.message) {
          setError(gruposRes.message);
        }
        if (docentesRes.data) {
          setDocentes(docentesRes.data);
        }
      }
      setLoading(false);
    }
    init();
  }, [curso.id]);

  const handleRefreshGrupos = async (periodId: string) => {
    const res = await getGruposAction(curso.id, periodId);
    if (res.data) {
      setGrupos(res.data);
    }
  };

  const handleAddGrupo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activePeriodId) return;

    setActionPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append('cursoId', curso.id);
    formData.append('periodoId', activePeriodId);

    const result = await addGrupoAction(undefined, formData);

    if (result.success) {
      formRef.current?.reset();
      await handleRefreshGrupos(activePeriodId);
    } else {
      setError(result.message || 'Error al agregar sección.');
      if (result.errors) setFieldErrors(result.errors);
    }
    setActionPending(false);
  };

  const handleDeleteGrupo = async (id: string) => {
    if (!activePeriodId) return;
    if (!confirm('¿Está seguro de eliminar esta sección? Esto podría afectar asignaciones de horarios existentes.')) {
      return;
    }

    setLoading(true);
    const result = await removeGrupoAction(id);
    if (result.success) {
      await handleRefreshGrupos(activePeriodId);
    } else {
      setError(result.message || 'Error al eliminar sección.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">Gestionar Secciones (Grupos)</h2>
            <p className="text-[11px] text-muted-foreground">
              Curso: {curso.nombre} ({curso.codigo})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activePeriodName && (
            <div className="px-3 py-1.5 bg-blue-500/10/50 border border-blue-500/20 rounded-md text-[11px] text-blue-600 font-medium inline-block">
              Período Activo: {activePeriodName}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Cargando secciones...</p>
            </div>
          ) : error && !activePeriodId ? (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div className="text-xs">
                <p className="font-semibold">Período Académico Requerido</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Form to Add Section */}
              <form ref={formRef} onSubmit={handleAddGrupo} className="p-4 bg-muted/40 rounded-xl border border-border space-y-3">
                <h3 className="text-xs font-semibold text-foreground">Agregar Nueva Sección</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium text-muted-foreground">Nombre de Seccion</Label>
                    <Input
                      name="nombre"
                      placeholder="Ej: A"
                      maxLength={5}
                      className="h-9 uppercase text-center font-bold"
                    />
                    {fieldErrors.nombre && (
                      <p className="text-[10px] text-destructive">{fieldErrors.nombre[0]}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium text-muted-foreground">N° Estudiantes Proyectados</Label>
                    <Input
                      name="numEstudiantes"
                      type="number"
                      placeholder="30"
                      className="h-9"
                      min={1}
                      max={100}
                    />
                    {fieldErrors.numEstudiantes && (
                      <p className="text-[10px] text-destructive">{fieldErrors.numEstudiantes[0]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground">Docente asignado</Label>
                  <select
                    name="docenteId"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sin asignar</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                  {fieldErrors.docenteId && (
                    <p className="text-[10px] text-destructive">{fieldErrors.docenteId[0]}</p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" disabled={actionPending} size="xs" className="h-8">
                    {actionPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 mr-1" />
                    )}
                    Agregar Sección
                  </Button>
                </div>
              </form>

              {/* List of Sections */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground">Secciones Registradas</h3>
                
                {grupos.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
                    No hay secciones registradas para este curso en el período activo.
                  </p>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                    {grupos.map((g) => {
                      const docenteName = g.docenteId
                        ? docentes.find((d) => d.id === g.docenteId)?.nombre ?? 'Docente asignado'
                        : null;
                      return (
                      <div key={g.id} className="flex items-center justify-between p-3.5 bg-card hover:bg-muted/10 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-foreground">Seccion {g.nombre}</p>
                          <p className="text-[10px] text-muted-foreground">Aforo estimado: {g.numEstudiantes} estudiantes</p>
                          {docenteName ? (
                            <p className="text-[10px] text-blue-600 font-medium mt-0.5">{docenteName}</p>
                          ) : (
                            <p className="text-[10px] text-amber-600 italic mt-0.5">Sin docente asignado</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGrupo(g.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {error && activePeriodId && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
