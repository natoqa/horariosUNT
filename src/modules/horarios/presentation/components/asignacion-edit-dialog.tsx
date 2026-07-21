'use client';

import { useState, useEffect } from 'react';
import { Asignacion, ASIGNACION_TIPO_LABELS } from '../../domain/entities/horario.entity';
import { Violation } from '../../domain/services/constraint-validator.service';
import { updateAsignacionAction } from '../actions/update-asignacion.action';
import { postPublishUpdateAction } from '../actions/post-publish-update.action';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';

interface AsignacionEditDialogProps {
  asignacion: Asignacion;
  docenteName: string;
  cursoName: string;
  aulaName: string;
  isPostPublish?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectOption {
  id: string;
  label: string;
}

export function AsignacionEditDialog({
  asignacion,
  docenteName,
  cursoName,
  aulaName,
  isPostPublish = false,
  onClose,
  onSuccess,
}: AsignacionEditDialogProps) {
  const [docenteId, setDocenteId] = useState(asignacion.docenteId);
  const [aulaId, setAulaId] = useState(asignacion.aulaId);
  const [dia, setDia] = useState(asignacion.dia);
  const [bloque, setBloque] = useState(asignacion.bloque);
  const [motivo, setMotivo] = useState('');

  const [docentes, setDocentes] = useState<SelectOption[]>([]);
  const [aulas, setAulas] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [pending, setPending] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const supabase = createClient();
      const [docentesRes, aulasRes] = await Promise.all([
        supabase.from('docentes').select('id, nombres, apellidos').eq('estado', 'Activo').order('apellidos'),
        supabase.from('aulas').select('id, codigo, nombre').eq('estado', 'Activa').order('codigo'),
      ]);

      setDocentes(
        (docentesRes.data ?? []).map((d) => ({
          id: d.id,
          label: `${d.apellidos}, ${d.nombres}`,
        })),
      );

      setAulas(
        (aulasRes.data ?? []).map((a) => ({
          id: a.id,
          label: `${a.codigo} - ${a.nombre}`,
        })),
      );

      setLoadingOptions(false);
    }
    loadOptions();
  }, []);

  const hasChanges =
    docenteId !== asignacion.docenteId ||
    aulaId !== asignacion.aulaId ||
    dia !== asignacion.dia ||
    bloque !== asignacion.bloque;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setViolations([]);
    setError(null);

    const data: Record<string, unknown> = {
      asignacionId: asignacion.id,
      motivo,
    };
    if (docenteId !== asignacion.docenteId) data.docenteId = docenteId;
    if (aulaId !== asignacion.aulaId) data.aulaId = aulaId;
    if (dia !== asignacion.dia) data.dia = dia;
    if (bloque !== asignacion.bloque) data.bloque = bloque;

    const result = isPostPublish
      ? await postPublishUpdateAction(data)
      : await updateAsignacionAction(data);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => onSuccess(), 600);
    } else if (result.violations && result.violations.length > 0) {
      setViolations(result.violations);
    } else {
      setError(result.message || 'Error al actualizar.');
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">
              {isPostPublish ? 'Cambio Post-Publicación' : 'Modificar Asignación'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cursoName} — {ASIGNACION_TIPO_LABELS[asignacion.tipo]}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isPostPublish && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-600">Horario publicado</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Este cambio se registrará en auditoría como modificación post-publicación.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted/50 border border-border px-4 py-3 text-xs space-y-1">
            <p><span className="font-medium">Actual:</span> {docenteName}</p>
            <p><span className="font-medium">Aula:</span> {aulaName}</p>
            <p><span className="font-medium">Horario:</span> {asignacion.dia} {asignacion.bloque}</p>
          </div>

          {loadingOptions ? (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Cargando opciones...
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Docente</Label>
                <select
                  value={docenteId}
                  onChange={(e) => setDocenteId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {docentes.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Aula</Label>
                <select
                  value={aulaId}
                  onChange={(e) => setAulaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {aulas.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Día</Label>
                  <select
                    value={dia}
                    onChange={(e) => setDia(e.target.value as typeof dia)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {DIAS_SEMANA.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Bloque</Label>
                  <select
                    value={bloque}
                    onChange={(e) => setBloque(e.target.value as typeof bloque)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {BLOQUES_HORARIOS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Motivo del cambio <span className="text-destructive">*</span>
                  {isPostPublish && (
                    <span className="text-amber-600 ml-1">(se registra en auditoría)</span>
                  )}
                </Label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={isPostPublish
                    ? 'Ej: Licencia médica del docente, cambio de aula por mantenimiento...'
                    : 'Describa la razón de la modificación...'
                  }
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </>
          )}

          {violations.length > 0 && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive">Conflictos detectados</p>
              </div>
              <ul className="space-y-1">
                {violations.map((v, i) => (
                  <li key={i} className="text-xs text-destructive">
                    <span className="font-medium">[{v.rule}]</span> {v.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-600">Asignación actualizada</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={pending || !hasChanges || motivo.length < 5 || loadingOptions || success}
            >
              {pending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
