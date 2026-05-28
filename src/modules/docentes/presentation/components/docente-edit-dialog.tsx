'use client';

import { useState } from 'react';
import { Docente } from '../../domain/entities/docente.entity';
import { updateDocenteAction } from '../actions/update-docente.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  CATEGORIAS_DOCENTE,
  REGIMENES_DOCENTE,
  CONDICIONES_DOCENTE,
  ESCUELAS_PROCEDENCIA,
} from '@/shared/constants/categories';
import { X } from 'lucide-react';

interface DocenteEditDialogProps {
  docente: Docente;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocenteEditDialog({ docente, onClose, onSuccess }: DocenteEditDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      id: docente.id,
      nombres: formData.get('nombres') as string,
      apellidos: formData.get('apellidos') as string,
      correo: formData.get('correo') as string,
      telefono: formData.get('telefono') as string,
      categoria: formData.get('categoria') as string,
      regimen: formData.get('regimen') as string,
      condicion: formData.get('condicion') as string,
      escuela: formData.get('escuela') as string,
      fechaIngreso: formData.get('fechaIngreso') as string,
      cargaMaxima: formData.get('cargaMaxima') as string,
    };

    const result = await updateDocenteAction(data);

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
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Editar Docente</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Nombres</Label>
              <Input name="nombres" defaultValue={docente.nombres} className="h-10" />
              {fieldErrors.nombres && (
                <p className="text-xs text-destructive">{fieldErrors.nombres[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Apellidos</Label>
              <Input name="apellidos" defaultValue={docente.apellidos} className="h-10" />
              {fieldErrors.apellidos && (
                <p className="text-xs text-destructive">{fieldErrors.apellidos[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
            <Input value={docente.dni} disabled className="h-10 bg-muted" />
            <p className="text-[11px] text-muted-foreground">El DNI no se puede modificar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Correo</Label>
              <Input name="correo" type="email" defaultValue={docente.correo} className="h-10" />
              {fieldErrors.correo && (
                <p className="text-xs text-destructive">{fieldErrors.correo[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Teléfono</Label>
              <Input name="telefono" defaultValue={docente.telefono || ''} className="h-10" />
              {fieldErrors.telefono && (
                <p className="text-xs text-destructive">{fieldErrors.telefono[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Categoría</Label>
              <select
                name="categoria"
                defaultValue={docente.categoria}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORIAS_DOCENTE.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {fieldErrors.categoria && (
                <p className="text-xs text-destructive">{fieldErrors.categoria[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Régimen</Label>
              <select
                name="regimen"
                defaultValue={docente.regimen}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {REGIMENES_DOCENTE.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
              {fieldErrors.regimen && (
                <p className="text-xs text-destructive">{fieldErrors.regimen[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Escuela de Procedencia</Label>
              <select
                name="escuela"
                defaultValue={docente.escuela}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {ESCUELAS_PROCEDENCIA.map((esc) => (
                  <option key={esc} value={esc}>{esc}</option>
                ))}
              </select>
              {fieldErrors.escuela && (
                <p className="text-xs text-destructive">{fieldErrors.escuela[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Condición</Label>
              <select
                name="condicion"
                defaultValue={docente.condicion}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONDICIONES_DOCENTE.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
              {fieldErrors.condicion && (
                <p className="text-xs text-destructive">{fieldErrors.condicion[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Fecha de Ingreso</Label>
              <Input name="fechaIngreso" type="date" defaultValue={docente.fechaIngreso} className="h-10" />
              {fieldErrors.fechaIngreso && (
                <p className="text-xs text-destructive">{fieldErrors.fechaIngreso[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Carga Máxima (hrs)</Label>
              <Input name="cargaMaxima" type="number" defaultValue={docente.cargaMaxima} className="h-10" />
              {fieldErrors.cargaMaxima && (
                <p className="text-xs text-destructive">{fieldErrors.cargaMaxima[0]}</p>
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
