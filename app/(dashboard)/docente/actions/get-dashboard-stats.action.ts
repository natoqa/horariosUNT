'use server';

import { createClient } from '@/shared/lib/supabase/server';

export interface DocenteDashboardStats {
  sesionesAsignadas: number;
  cursosAsignados: number;
}

export async function getDocenteDashboardStatsAction(): Promise<DocenteDashboardStats> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        sesionesAsignadas: 0,
        cursosAsignados: 0,
      };
    }

    // Obtener docente asociado al usuario
    const { data: docenteData } = await supabase
      .from('docentes')
      .select('id')
      .eq('correo', user.email)
      .single();

    if (!docenteData) {
      return {
        sesionesAsignadas: 0,
        cursosAsignados: 0,
      };
    }

    // Obtener período publicado/aprobado actual
    const { data: periodoData } = await supabase
      .from('periodos')
      .select('id')
      .in('state', ['Aprobado', 'Publicado', 'Cerrado'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!periodoData) {
      return {
        sesionesAsignadas: 0,
        cursosAsignados: 0,
      };
    }

    // Obtener grupos asignados al docente en el período actual
    const { data: grupos, error } = await supabase
      .from('grupos')
      .select('id, curso_id')
      .eq('docente_id', docenteData.id)
      .eq('periodo_id', periodoData.id);

    if (error) throw error;

    const totalGrupos = grupos?.length || 0;
    const cursosUnicos = new Set(grupos?.map((g: any) => g.curso_id) || []);

    return {
      sesionesAsignadas: totalGrupos,
      cursosAsignados: cursosUnicos.size,
    };
  } catch (error) {
    console.error('Error fetching docente dashboard stats:', error);
    return {
      sesionesAsignadas: 0,
      cursosAsignados: 0,
    };
  }
}
