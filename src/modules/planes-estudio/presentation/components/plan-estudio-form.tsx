'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { savePlanEstudioSchema } from '../../application/dtos/save-plan-estudio.dto';
import { savePlanEstudioAction } from '../actions/save-plan-estudio.action';
import { PlanEstudio } from '../../domain/entities/plan-estudio.entity';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Upload, HelpCircle } from 'lucide-react';

interface PlanEstudioFormProps {
  onSuccess?: () => void;
  initialPlan?: PlanEstudio | null;
}

export function PlanEstudioForm({ onSuccess, initialPlan }: PlanEstudioFormProps) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const isEditing = !!initialPlan;

  const form = useForm({
    resolver: zodResolver(savePlanEstudioSchema),
    defaultValues: {
      nombre: initialPlan?.nombre || 'Plan de Estudio',
      anio: initialPlan?.anio || new Date().getFullYear(),
      pdfUrl: initialPlan?.pdfUrl || '',
      estado: initialPlan?.estado || 'Activo',
      fechaPublicacion: initialPlan?.fechaPublicacion || '',
    },
  });

  useEffect(() => {
    if (initialPlan) {
      form.reset({
        nombre: initialPlan.nombre,
        anio: initialPlan.anio,
        pdfUrl: initialPlan.pdfUrl || '',
        estado: initialPlan.estado,
        fechaPublicacion: initialPlan.fechaPublicacion || '',
      });
    }
  }, [initialPlan, form]);

  const onSubmit = async (data: any) => {
    console.log('Formulario enviado:', data);
    console.log('Errores de validación:', form.formState.errors);
    setLoading(true);
    try {
      if (isEditing && initialPlan) {
        // Editar plan existente
        const { updatePlanEstudioAction } = await import('../actions/update-plan-estudio.action');
        const result = await updatePlanEstudioAction(initialPlan.id, {
          nombre: data.nombre,
          anio: data.anio,
          estado: data.estado,
        });
        
        if (result.success) {
          toast.success('Plan de estudios actualizado exitosamente');
          form.reset();
          setPdfFile(null);
          onSuccess?.();
        } else {
          toast.error(result.error || 'Error al actualizar plan de estudios');
        }
      } else {
        // Crear nuevo plan
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

        console.log('FormData preparado, llamando a savePlanEstudioAction');
        const result = await savePlanEstudioAction(formData);
        console.log('Resultado de savePlanEstudioAction:', result);
        
        if (result.success) {
          if (result.mensajeParcial) {
            // Hay errores parciales
            toast.warning(result.mensajeParcial);
            if (result.detallesFallidos && result.detallesFallidos.length > 0) {
              console.error('Cursos fallidos:', result.detallesFallidos);
              // Mostrar detalles de errores en consola para debugging
            }
          } else {
            const mensaje = result.cursosCreados > 0
              ? `Plan de estudios registrado exitosamente. ${result.cursosCreados} cursos extraídos del archivo.`
              : 'Plan de estudios registrado exitosamente.';
            toast.success(mensaje);
          }
          form.reset();
          setPdfFile(null);
          onSuccess?.();
        } else {
          toast.error(result.error || 'Error al registrar plan de estudios');
        }
      }
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast.error('Error al guardar plan de estudios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Año</Label>
            <span title="Año académico del plan de estudios (ej: 2018)">
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </span>
          </div>
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

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
            <span title="Estado del plan: Activo (en uso) o Inactivo (archivado)">
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </span>
          </div>
          <select
            {...form.register('estado')}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Archivo del plan de estudios</Label>
          <span title="Archivo PDF, Excel o CSV con los cursos del plan. Se extraerán automáticamente.">
            <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
          </span>
        </div>
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

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (isEditing ? 'Actualizando...' : 'Registrando...') : (isEditing ? 'Actualizar plan de estudios' : 'Registrar plan de estudios')}
      </Button>
    </form>
  );
}
