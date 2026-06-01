'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Periodo } from '@/modules/periodos';

export interface DocenteResumen {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string | null;
  categoria: string;
  regimen: string;
  registrado: boolean;
  totalBloques: number;
  fechaRegistro: string | null;
}

export interface DirectorResumenResult {
  periodo?: Periodo;
  docentes?: DocenteResumen[];
  message?: string;
}

export async function getDirectorResumenAction(): Promise<DirectorResumenResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'director') {
    return { message: 'Solo el Director puede acceder a este resumen.' };
  }

  // Get active period
  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos')
    .select('*')
    .neq('state', 'Cerrado')
    .limit(1)
    .single();

  if (periodoError || !periodoData) {
    return { message: 'No hay un período académico activo.' };
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

  // Get all active docentes
  const { data: docentesData, error: docentesError } = await supabase
    .from('docentes')
    .select('id, nombres, apellidos, dni, correo, telefono, categoria, regimen')
    .eq('estado', 'Activo')
    .order('apellidos', { ascending: true });

  if (docentesError || !docentesData) {
    return { message: 'Error al cargar los docentes.', periodo };
  }

  // Get availability counts per docente for this period
  const { data: disponibilidadData, error: disponibilidadError } = await supabase
    .from('disponibilidad')
    .select('docente_id, estado, updated_at')
    .eq('periodo_id', periodoData.id)
    .in('estado', ['Disponible', 'Preferido']);

  if (disponibilidadError) {
    return { message: 'Error al cargar la disponibilidad.', periodo };
  }

  // Build a map: docenteId -> { count, lastUpdated }
  const disponibilidadMap = new Map<string, { count: number; lastUpdated: string | null }>();
  if (disponibilidadData) {
    for (const row of disponibilidadData) {
      const existing = disponibilidadMap.get(row.docente_id);
      if (existing) {
        existing.count += 1;
        if (row.updated_at && (!existing.lastUpdated || row.updated_at > existing.lastUpdated)) {
          existing.lastUpdated = row.updated_at;
        }
      } else {
        disponibilidadMap.set(row.docente_id, {
          count: 1,
          lastUpdated: row.updated_at || null,
        });
      }
    }
  }

  const docentes: DocenteResumen[] = docentesData.map((d) => {
    const disp = disponibilidadMap.get(d.id);
    return {
      id: d.id,
      nombres: d.nombres,
      apellidos: d.apellidos,
      dni: d.dni,
      correo: d.correo,
      telefono: d.telefono ?? null,
      categoria: d.categoria,
      regimen: d.regimen,
      registrado: (disp?.count ?? 0) > 0,
      totalBloques: disp?.count ?? 0,
      fechaRegistro: disp?.lastUpdated ?? null,
    };
  });

  return { periodo, docentes };
}
