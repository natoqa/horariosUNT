'use server';

import { createClient } from '@/shared/lib/supabase/server';

export interface DocenteDashboardStats {
  sesionesAsignadas: number;
  cursosAsignados: number;
}

export async function getDocenteDashboardStatsAction(): Promise<DocenteDashboardStats> {
  try {
    const supabase = await createClient();
    
    // Obtener todas las asignaciones
    const { data: asignaciones, error } = await supabase
      .from('asignaciones')
      .select('grupo_id');

    if (error) throw error;

    const totalAsignaciones = asignaciones?.length || 0;
    const gruposUnicos = new Set(asignaciones?.map((a: any) => a.grupo_id) || []);

    return {
      sesionesAsignadas: totalAsignaciones,
      cursosAsignados: gruposUnicos.size,
    };
  } catch (error) {
    console.error('Error fetching docente dashboard stats:', error);
    return {
      sesionesAsignadas: 0,
      cursosAsignados: 0,
    };
  }
}
