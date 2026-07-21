'use client';

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { PlanEstudio } from '../../domain/entities/plan-estudio.entity';
import { getPlanesEstudioAction } from '../actions/get-planes-estudio.action';
import { deletePlanEstudioAction } from '../actions/delete-plan-estudio.action';
import { PLAN_ESTADO_LABELS } from '../../domain/entities/plan-estudio.entity';
import { Button } from '@/shared/components/ui/button';
import { Trash2, FileText, Calendar, Power, PowerOff, Edit } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';
import { toast } from 'sonner';

export interface PlanEstudioTableRef {
  refresh: () => void;
}

export interface PlanEstudioTableProps {
  onEdit?: (plan: PlanEstudio) => void;
}

export const PlanEstudioTable = forwardRef<PlanEstudioTableRef, PlanEstudioTableProps>(function PlanEstudioTable({ onEdit }, ref) {
  const { user } = useAuth();
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  const loadPlanes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPlanesEstudioAction();
    if (result.data) {
      setPlanes(result.data);
    } else {
      setError(result.error || 'Error al cargar planes de estudio.');
    }
    setLoading(false);
  }, []);

  useImperativeHandle(ref, () => ({ refresh: loadPlanes }));

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar el plan de estudios "${nombre}"?`)) return;
    
    const result = await deletePlanEstudioAction(id);
    if (result.success) {
      toast.success('Plan de estudios eliminado exitosamente');
      loadPlanes();
    } else {
      toast.error(result.error || 'Error al eliminar plan de estudios');
    }
  };

  const handleToggleEstado = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === 'Activo' ? 'Inactivo' : 'Activo';
    const action = newEstado === 'Activo' ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de ${action} el plan?`)) return;
    
    try {
      const { updatePlanEstudioAction } = await import('../actions/update-plan-estudio.action');
      const result = await updatePlanEstudioAction(id, { estado: newEstado });
      if (result.success) {
        toast.success(`Plan ${action}do exitosamente`);
        loadPlanes();
      } else {
        toast.error(result.error || `Error al ${action} plan`);
      }
    } catch (error) {
      toast.error('Error al cambiar estado del plan');
    }
  };

  const handleEdit = (plan: PlanEstudio) => {
    onEdit?.(plan);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando planes de estudio...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      ) : planes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin planes de estudio registrados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Registre el primer plan de estudios usando el formulario
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Año</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cursos</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Docentes</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-foreground">{plan.nombre}</td>
                  <td className="px-6 py-3.5 text-muted-foreground text-xs">{plan.anio}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                       <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold ${plan.cursosCount ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                         {plan.cursosCount || 0}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                       <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold ${plan.docentesCount ? 'bg-chart-3/10 text-chart-3' : 'bg-destructive/10 text-destructive'}`}>
                         {plan.docentesCount || 0}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      plan.estado === 'Activo' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600' 
                        : 'bg-muted border border-border text-muted-foreground'
                    }`}>
                      {PLAN_ESTADO_LABELS[plan.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {isAllowed && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
                          title="Editar plan de estudios"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleEstado(plan.id, plan.estado)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
                          title={plan.estado === 'Activo' ? 'Desactivar plan' : 'Activar plan'}
                        >
                          {plan.estado === 'Activo' ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.nombre)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar plan de estudios"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
});
