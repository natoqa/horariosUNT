'use client';

import { useState } from 'react';
import { Curso } from '../../domain/entities/curso.entity';
import { updateCursoAction } from '../actions/update-curso.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { X } from 'lucide-react';

interface CursoEditDialogProps {
  curso: Curso;
  onClose: () => void;
  onSuccess: () => void;
}

export function CursoEditDialog({ curso, onClose, onSuccess }: CursoEditDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [requiereLab, setRequiereLab] = useState(curso.requiereLaboratorio);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await updateCursoAction(curso.id, undefined, formData);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message || 'Error al actualizar.');
      if (result.errors) setFieldErrors(result.errors);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">Editar Curso</h2>
            <p className="text-[11px] text-muted-foreground">Código: {curso.codigo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Código (Solo Lectura)</Label>
            <Input value={curso.codigo} disabled className="h-10 bg-muted uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Nombre del Curso</Label>
            <Input name="nombre" defaultValue={curso.nombre} className="h-10" />
            {fieldErrors.nombre && (
              <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Ciclo</Label>
              <select
                name="ciclo"
                defaultValue={curso.ciclo}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map((c) => (
                  <option key={c} value={c}>Ciclo {c}</option>
                ))}
              </select>
              {fieldErrors.ciclo && (
                <p className="text-xs text-destructive">{fieldErrors.ciclo[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tipo de Curso</Label>
              <select
                name="tipo"
                defaultValue={curso.tipo}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {['Teórico', 'Práctico', 'Teórico-Práctico'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {fieldErrors.tipo && (
                <p className="text-xs text-destructive">{fieldErrors.tipo[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Horas Teóricas</Label>
              <Input
                name="horasTeoricas"
                type="number"
                defaultValue={curso.horasTeoricas}
                className="h-10"
                min={0}
              />
              {fieldErrors.horasTeoricas && (
                <p className="text-xs text-destructive">{fieldErrors.horasTeoricas[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Horas Prácticas</Label>
              <Input
                name="horasPracticas"
                type="number"
                defaultValue={curso.horasPracticas}
                className="h-10"
                min={0}
              />
              {fieldErrors.horasPracticas && (
                <p className="text-xs text-destructive">{fieldErrors.horasPracticas[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Créditos</Label>
              <Input
                name="creditos"
                type="number"
                defaultValue={curso.creditos}
                className="h-10"
                min={1}
                max={10}
              />
              {fieldErrors.creditos && (
                <p className="text-xs text-destructive">{fieldErrors.creditos[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">¿Requiere Laboratorio?</Label>
              <select
                name="requiereLaboratorio"
                value={String(requiereLab)}
                onChange={(e) => setRequiereLab(e.target.value === 'true')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
              {fieldErrors.requiereLaboratorio && (
                <p className="text-xs text-destructive">{fieldErrors.requiereLaboratorio[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tipo de Laboratorio</Label>
              <Input
                name="tipoLaboratorio"
                disabled={!requiereLab}
                defaultValue={curso.tipoLaboratorio || ''}
                placeholder={requiereLab ? "Ej: Lab de Cómputo" : "No aplica"}
                className="h-10"
              />
              {fieldErrors.tipoLaboratorio && (
                <p className="text-xs text-destructive">{fieldErrors.tipoLaboratorio[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
              <select
                name="estado"
                defaultValue={curso.estado}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {fieldErrors.estado && (
                <p className="text-xs text-destructive">{fieldErrors.estado[0]}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} size="sm">
              {pending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
