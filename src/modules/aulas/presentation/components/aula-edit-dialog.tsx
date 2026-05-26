'use client';

import { useState } from 'react';
import { Aula } from '../../domain/entities/aula.entity';
import { updateAulaAction } from '../actions/update-aula.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { X } from 'lucide-react';

interface AulaEditDialogProps {
  aula: Aula;
  onClose: () => void;
  onSuccess: () => void;
}

export function AulaEditDialog({ aula, onClose, onSuccess }: AulaEditDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await updateAulaAction(aula.id, undefined, formData);

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
            <h2 className="text-sm font-semibold">Editar Aula / Espacio Físico</h2>
            <p className="text-[11px] text-muted-foreground">Código: {aula.codigo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Código (Solo Lectura)</Label>
            <Input value={aula.codigo} disabled className="h-10 bg-muted uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Nombre del Espacio</Label>
            <Input name="nombre" defaultValue={aula.nombre} className="h-10" />
            {fieldErrors.nombre && (
              <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Pabellón</Label>
              <Input name="pabellon" defaultValue={aula.pabellon || ''} className="h-10" />
              {fieldErrors.pabellon && (
                <p className="text-xs text-destructive">{fieldErrors.pabellon[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Piso</Label>
              <Input name="piso" type="number" defaultValue={aula.piso || ''} className="h-10" />
              {fieldErrors.piso && (
                <p className="text-xs text-destructive">{fieldErrors.piso[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Capacidad</Label>
              <Input name="capacidad" type="number" defaultValue={aula.capacidad} className="h-10" />
              {fieldErrors.capacidad && (
                <p className="text-xs text-destructive">{fieldErrors.capacidad[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
              <select
                name="tipo"
                defaultValue={aula.tipo}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {['Aula Teórica', 'Laboratorio de Cómputo', 'Laboratorio Especializado', 'Auditorio'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {fieldErrors.tipo && (
                <p className="text-xs text-destructive">{fieldErrors.tipo[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Equipamiento (Separado por comas)</Label>
            <Input name="equipamiento" defaultValue={aula.equipamiento.join(', ')} className="h-10" />
            {fieldErrors.equipamiento && (
              <p className="text-xs text-destructive">{fieldErrors.equipamiento[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
            <select
              name="estado"
              defaultValue={aula.estado}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
            {fieldErrors.estado && (
              <p className="text-xs text-destructive">{fieldErrors.estado[0]}</p>
            )}
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
