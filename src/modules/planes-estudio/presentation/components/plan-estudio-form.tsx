'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { savePlanEstudioSchema } from '../../application/dtos/save-plan-estudio.dto';
import { savePlanEstudioAction } from '../actions/save-plan-estudio.action';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface PlanEstudioFormProps {
  onSuccess?: () => void;
}

export function PlanEstudioForm({ onSuccess }: PlanEstudioFormProps) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(savePlanEstudioSchema),
    defaultValues: {
      nombre: '',
      anio: new Date().getFullYear(),
      pdfUrl: '',
      estado: 'Activo',
      fechaPublicacion: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('anio', data.anio.toString());
      formData.append('estado', data.estado);
      if (data.fechaPublicacion) {
        formData.append('fechaPublicacion', data.fechaPublicacion);
      }
      if (pdfFile) {
        formData.append('archivo', pdfFile);
      }

      const result = await savePlanEstudioAction(formData);
      if (result.success) {
        const mensaje = result.cursosCreados > 0
          ? `Plan de estudios registrado exitosamente. ${result.cursosCreados} cursos extraídos del archivo.`
          : 'Plan de estudios registrado exitosamente.';
        toast.success(mensaje);
        form.reset();
        setPdfFile(null);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Error al registrar plan de estudios');
      }
    } catch (error) {
      toast.error('Error al registrar plan de estudios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Nombre del plan</Label>
          <Input
            {...form.register('nombre')}
            placeholder="Ej: Plan de Estudios 2018"
            className="h-9"
          />
          {form.formState.errors.nombre && (
            <p className="text-[10px] text-destructive">{form.formState.errors.nombre.message?.toString()}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Año</Label>
          <Input
            type="number"
            {...form.register('anio')}
            placeholder="Ej: 2018"
            className="h-9"
          />
          {form.formState.errors.anio && (
            <p className="text-[10px] text-destructive">{form.formState.errors.anio.message?.toString()}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Archivo del plan de estudios</Label>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="h-9"
          />
          {pdfFile && (
            <span className="text-xs text-muted-foreground">{pdfFile.name}</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          El archivo (PDF, Excel o CSV) se analizará para extraer automáticamente los cursos del plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
          <select
            {...form.register('estado')}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Fecha de publicación</Label>
          <Input
            type="date"
            {...form.register('fechaPublicacion')}
            className="h-9"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Registrando...' : 'Registrar plan de estudios'}
      </Button>
    </form>
  );
}
