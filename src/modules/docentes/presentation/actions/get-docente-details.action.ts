'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseDisponibilidadRepository } from '@/modules/disponibilidad/infrastructure/supabase-disponibilidad.repository';
import { GetDisponibilidadUseCase } from '@/modules/disponibilidad/application/use-cases/get-disponibilidad.use-case';
import { Disponibilidad } from '@/modules/disponibilidad/domain/entities/disponibilidad.entity';
import { Periodo } from '@/modules/periodos/domain/entities/periodo.entity';

export interface GrupoAsignado {
  id: string;
  nombreGrupo: string;
  numEstudiantes: number;
  curso: {
    id: string;
    codigo: string;
    nombre: string;
    ciclo: string;
    tipo: string;
    horasTeoricas: number;
    horasPracticas: number;
    creditos: number;
  };
}

export async function getDocenteDetailsAction(
  docenteId: string,
): Promise<{ 
  disponibilidad?: Disponibilidad[]; 
  periodo?: Periodo; 
  asignaciones?: GrupoAsignado[]; 
  message?: string; 
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para consultar estos detalles.' };
  }

  try {
    // Buscar el periodo activo actual
    const { data: periodoData, error: periodoError } = await supabase
      .from('periodos')
      .select('*')
      .neq('state', 'Cerrado')
      .limit(1)
      .single();

    if (periodoError || !periodoData) {
      return { message: 'No hay un periodo activo en este momento.' };
    }

    const periodo: Periodo = {
      id: periodoData.id,
      name: periodoData.name,
      tipoCiclo: periodoData.tipo_ciclo,
      startDate: periodoData.start_date,
      endDate: periodoData.end_date,
      availabilityDeadline: periodoData.availability_deadline,
      state: periodoData.state,
      createdAt: periodoData.created_at,
      updatedAt: periodoData.updated_at,
    };

    const repo = new SupabaseDisponibilidadRepository();
    const useCase = new GetDisponibilidadUseCase(repo);
    const disponibilidad = await useCase.execute(docenteId, periodo.id);

    // Obtener grupos y cursos asignados
    const { data: asignacionesData, error: asignacionesError } = await supabase
      .from('grupos')
      .select('id, nombre, num_estudiantes, cursos!inner(id, codigo, nombre, ciclo, tipo, horas_teoricas, horas_practicas, creditos)')
      .eq('periodo_id', periodo.id)
      .eq('docente_id', docenteId);

    if (asignacionesError) {
      console.error('Error fetching assigned groups:', asignacionesError.message);
    }

    const asignaciones: GrupoAsignado[] = (asignacionesData ?? []).map((g: any) => ({
      id: g.id,
      nombreGrupo: g.nombre,
      numEstudiantes: g.num_estudiantes,
      curso: {
        id: g.cursos.id,
        codigo: g.cursos.codigo,
        nombre: g.cursos.nombre,
        ciclo: g.cursos.ciclo,
        tipo: g.cursos.tipo,
        horasTeoricas: g.cursos.horas_teoricas,
        horasPracticas: g.cursos.horas_practicas,
        creditos: g.cursos.creditos,
      },
    }));

    return { disponibilidad, periodo, asignaciones };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al cargar detalles del docente.' };
  }
}
