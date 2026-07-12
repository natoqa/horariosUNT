'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Asignacion } from '../../domain/entities/horario.entity';
import { CICLOS_IMPAR, CICLOS_PAR } from '@/modules/periodos';

interface DocenteHorarioData {
  periodoId: string;
  periodoName: string;
  horarioEstado: string;
  asignaciones: Asignacion[];
  cursoNames: Record<string, string>;
  aulaNames: Record<string, string>;
  grupoCiclos: Record<string, string>;
  actividadesNoLectivas: Array<{
    id: string;
    tipo: string;
    horas: number;
    detalles: string;
    dia?: string;
    bloque?: string;
  }>;
}

interface GetDocenteHorarioResult {
  data?: DocenteHorarioData;
  message?: string;
  debug?: {
    periodoId?: string;
    periodoState?: string;
    horarioId?: string;
    horarioEstado?: string;
    docenteId?: string;
    totalAsignaciones?: number;
    asignacionesFiltradas?: number;
    gruposAsignados?: number;
    actividadesNoLectivas?: number;
  };
}

export async function getDocenteHorarioAction(
  overrideDocenteId?: string
): Promise<GetDocenteHorarioResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  // Allow docente, director, and secretaria to access
  if (role !== 'docente' && role !== 'director' && role !== 'secretaria') {
    return { message: 'No autorizado.' };
  }

  // Use override docenteId if provided (for director/secretaria viewing other docentes)
  const targetDocenteId = overrideDocenteId || user.id;

  // Find an active periodo (any state)
  const { data: periodoData } = await supabase
    .from('periodos')
    .select('id, name, state, tipo_ciclo')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!periodoData) {
    return { message: 'No hay un período disponible para consultar.' };
  }

  console.log('[DocenteHorario] Periodo encontrado:', periodoData.id, periodoData.name, periodoData.state);

  // Find all horarios for this periodo (to debug)
  console.log('[DocenteHorario] Buscando horarios con periodo_id:', periodoData.id);
  const { data: allHorarios, error: allHorariosError } = await supabase
    .from('horarios')
    .select('id, periodo_id, estado, created_at')
    .eq('periodo_id', periodoData.id);

  console.log('[DocenteHorario] Todos los horarios del periodo:', allHorarios);
  console.log('[DocenteHorario] Cantidad de horarios:', allHorarios?.length);
  console.log('[DocenteHorario] Error al buscar horarios:', allHorariosError);
  console.log('[DocenteHorario] Error details:', JSON.stringify(allHorariosError));

  // Find the latest horario for this periodo (optional)
  const { data: horarioData, error: horarioError } = await supabase
    .from('horarios')
    .select('id, estado')
    .eq('periodo_id', periodoData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get docente data - use targetDocenteId if provided, otherwise search by email
  let docenteData;
  let docenteError;
  
  if (overrideDocenteId) {
    // Director/secretaria viewing another docente's schedule
    const result = await supabase
      .from('docentes')
      .select('id')
      .eq('id', targetDocenteId)
      .single();
    docenteData = result.data;
    docenteError = result.error;
  } else {
    // Docente viewing their own schedule
    const result = await supabase
      .from('docentes')
      .select('id')
      .eq('correo', user.email)
      .single();
    docenteData = result.data;
    docenteError = result.error;
  }

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un registro de docente asociado a este usuario.' };
  }

  // Get assignments - first try horario, then manual group assignments
  let asignaciones: Asignacion[] = [];
  let horarioId = '';
  let allAsignacionesFromHorario: any[] | null = null; // Declare outside the if block
  
  // Get groups assigned to the docente in this period (always for debug)
  const { data: gruposAsignados } = await supabase
    .from('grupos')
    .select('id, curso_id, nombre')
    .eq('docente_id', docenteData.id)
    .eq('periodo_id', periodoData.id);

  if (horarioData) {
    horarioId = horarioData.id;
    // Get all assignments for this horario
    const { data: allAsignaciones } = await supabase
      .from('asignaciones')
      .select('id, horario_id, grupo_id, docente_id, aula_id, dia, bloque, tipo, created_at')
      .eq('horario_id', horarioData.id);
    allAsignacionesFromHorario = allAsignaciones;

    // Filter by docente
    const rawAsignaciones = allAsignaciones?.filter((a) => a.docente_id === docenteData.id) ?? [];

    if (rawAsignaciones && rawAsignaciones.length > 0) {
      asignaciones = rawAsignaciones.map((a) => ({
        id: a.id,
        horarioId: a.horario_id,
        grupoId: a.grupo_id,
        docenteId: a.docente_id,
        aulaId: a.aula_id,
        dia: a.dia,
        bloque: a.bloque,
        tipo: a.tipo?.toLowerCase().startsWith('pr') ? 'practico' : 'teorico',
        createdAt: a.created_at,
      }));
    }
  }

  // If no assignments in horario, check for manual group assignments
  if (asignaciones.length === 0) {
    if (gruposAsignados && gruposAsignados.length > 0) {
      // Create placeholder assignments for manual group assignments
      asignaciones = gruposAsignados.map((g) => ({
        id: `manual-${g.id}`,
        horarioId: horarioId || 'pending',
        grupoId: g.id,
        docenteId: docenteData.id,
        aulaId: '',
        dia: 'Pendiente',
        bloque: 'Pendiente',
        tipo: 'teorico',
        createdAt: new Date().toISOString(),
      }));
    }
  }

  // If still no assignments, return empty message
  if (asignaciones.length === 0) {
    // Check if there are actividades no lectivas at least
    const { data: actividadesCheck } = await supabase
      .from('actividades_no_lectivas')
      .select('id')
      .eq('docente_id', docenteData.id)
      .eq('periodo_id', periodoData.id);

    if (!actividadesCheck || actividadesCheck.length === 0) {
      return { 
        message: 'No tienes asignaciones ni actividades no lectivas en el período actual.',
      };
    }
  }

  // Load name maps - only load groups that are in the docente's assignments
  const grupoIdsInAsignaciones = asignaciones.map(a => a.grupoId);
  
  const [cursosRes, aulasRes, gruposRes] = await Promise.all([
    supabase.from('cursos').select('id, nombre, ciclo'),
    supabase.from('aulas').select('id, nombre, codigo'),
    supabase.from('grupos').select('id, curso_id, nombre').in('id', grupoIdsInAsignaciones),
  ]);

  const cursoIdToName: Record<string, string> = {};
  const cursoIdToCiclo: Record<string, string> = {};
  (cursosRes.data ?? []).forEach((c) => {
    cursoIdToName[c.id] = c.nombre;
    cursoIdToCiclo[c.id] = c.ciclo;
  });

  const cursoNames: Record<string, string> = {};
  const grupoCiclos: Record<string, string> = {};
  (gruposRes.data ?? []).forEach((g) => {
    const cursoNombre = cursoIdToName[g.curso_id];
    cursoNames[g.id] = cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre;
    const ciclo = cursoIdToCiclo[g.curso_id];
    if (ciclo) grupoCiclos[g.id] = ciclo;
  });

  const aulaNames: Record<string, string> = {};
  (aulasRes.data ?? []).forEach((a) => {
    aulaNames[a.id] = `${a.codigo} - ${a.nombre}`;
  });

  // Get actividades no lectivas for the docente
  const { data: actividadesNoLectivas } = await supabase
    .from('actividades_no_lectivas')
    .select('id, tipo, horas, detalles, dia, bloque')
    .eq('docente_id', docenteData.id)
    .eq('periodo_id', periodoData.id);

  // Filter lective asignaciones based on periodo tipoCiclo
  const expectedCiclos = periodoData.tipo_ciclo === 'Impar' ? CICLOS_IMPAR : CICLOS_PAR;
  
  const filteredAsignaciones = asignaciones.filter((a) => {
    const ciclo = grupoCiclos[a.grupoId];
    if (!ciclo) return false;
    return expectedCiclos.some(c => c === ciclo);
  });

  // Filter non-lective activities based on periodo tipoCiclo
  // Only include non-lective activities if docente has courses in current periodo
  const currentAssignmentCiclos = new Set<string>();
  filteredAsignaciones.forEach((asignacion) => {
    const ciclo = grupoCiclos[asignacion.grupoId];
    if (ciclo) {
      currentAssignmentCiclos.add(ciclo);
    }
  });
  
  const hasMatchingCourses = Array.from(currentAssignmentCiclos).some(ciclo => expectedCiclos.some(c => c === ciclo));
  const filteredActividadesNoLectivas = hasMatchingCourses ? (actividadesNoLectivas ?? []) : [];

  // Debug info
  const debug = {
    periodoId: periodoData.id,
    periodoState: periodoData.state,
    horarioId: horarioData?.id,
    horarioEstado: horarioData?.estado,
    docenteId: docenteData.id,
    totalAsignaciones: allAsignacionesFromHorario?.length || 0,
    asignacionesFiltradas: filteredAsignaciones.length,
    gruposAsignados: gruposAsignados?.length || 0,
    actividadesNoLectivas: actividadesNoLectivas?.length || 0,
  };
  console.log('[DocenteHorario] Debug:', debug);

  return {
    data: {
      periodoId: periodoData.id,
      periodoName: periodoData.name,
      horarioEstado: horarioData?.estado || 'Pendiente',
      asignaciones: filteredAsignaciones,
      cursoNames,
      aulaNames,
      grupoCiclos,
      actividadesNoLectivas: filteredActividadesNoLectivas,
    },
    debug,
  };
}
