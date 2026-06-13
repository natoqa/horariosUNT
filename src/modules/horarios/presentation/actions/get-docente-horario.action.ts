'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Asignacion } from '../../domain/entities/horario.entity';

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

export async function getDocenteHorarioAction(): Promise<GetDocenteHorarioResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'docente') {
    return { message: 'Solo los docentes pueden acceder a esta vista.' };
  }

  // Find an active periodo (any state)
  const { data: periodoData } = await supabase
    .from('periodos')
    .select('id, name, state')
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

  console.log('[DocenteHorario] Horario encontrado:', horarioData?.id, horarioData?.estado);
  console.log('[DocenteHorario] HorarioError:', horarioError);

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    console.error('[DocenteHorario] Error buscando docente:', docenteError);
    return { message: 'No se encontró un registro de docente asociado a este usuario.' };
  }

  console.log('[DocenteHorario] Docente encontrado:', docenteData.id);

  // Get assignments - first try horario, then manual group assignments
  let asignaciones: Asignacion[] = [];
  let horarioId = '';

  const debugInfo: any = {
    periodoId: periodoData.id,
    periodoState: periodoData.state,
    horarioId: horarioData?.id,
    horarioEstado: horarioData?.estado,
    horarioDataExists: !!horarioData,
    allHorariosCount: allHorarios?.length || 0,
    allHorarios: allHorarios,
    horarioError: horarioError?.message,
    docenteId: docenteData.id,
  };

  console.log('[DocenteHorario] HorarioData:', horarioData);
  console.log('[DocenteHorario] HorarioData exists:', !!horarioData);

  if (horarioData) {
    horarioId = horarioData.id;
    // Get all assignments for this horario (without docente filter first to debug)
    const { data: allAsignaciones } = await supabase
      .from('asignaciones')
      .select('id, horario_id, grupo_id, docente_id, aula_id, dia, bloque, tipo, created_at')
      .eq('horario_id', horarioData.id);

    debugInfo.totalAsignaciones = allAsignaciones?.length || 0;
    debugInfo.docenteIdsInAsignaciones = allAsignaciones?.map(a => a.docente_id);
    console.log('[DocenteHorario] Total asignaciones en horario:', allAsignaciones?.length);
    console.log('[DocenteHorario] Docente ID a buscar:', docenteData.id);
    console.log('[DocenteHorario] Docente IDs en asignaciones:', allAsignaciones?.map(a => a.docente_id));

    // Filter by docente
    const rawAsignaciones = allAsignaciones?.filter((a) => a.docente_id === docenteData.id) ?? [];
    debugInfo.asignacionesFiltradas = rawAsignaciones.length;
    console.log('[DocenteHorario] Asignaciones filtradas por docente:', rawAsignaciones.length);

    if (rawAsignaciones && rawAsignaciones.length > 0) {
      asignaciones = rawAsignaciones.map((a) => ({
        id: a.id,
        horarioId: a.horario_id,
        grupoId: a.grupo_id,
        docenteId: a.docente_id,
        aulaId: a.aula_id,
        dia: a.dia,
        bloque: a.bloque,
        tipo: a.tipo,
        createdAt: a.created_at,
      }));
    }
  }

  // If no assignments in horario, check for manual group assignments
  if (asignaciones.length === 0) {
    // Get groups assigned to the docente in this period
    const { data: gruposAsignados } = await supabase
      .from('grupos')
      .select('id, curso_id, nombre')
      .eq('docente_id', docenteData.id)
      .eq('periodo_id', periodoData.id);

    debugInfo.gruposAsignados = gruposAsignados?.length || 0;
    console.log('[DocenteHorario] Grupos asignados encontrados:', gruposAsignados);

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
      console.log('[DocenteHorario] Asignaciones placeholder creadas:', asignaciones.length);
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

    debugInfo.actividadesNoLectivas = actividadesCheck?.length || 0;

    if (!actividadesCheck || actividadesCheck.length === 0) {
      return { 
        message: 'No tienes asignaciones ni actividades no lectivas en el período actual.',
        debug: debugInfo,
      };
    }
  }

  // Load name maps
  const [cursosRes, aulasRes, gruposRes] = await Promise.all([
    supabase.from('cursos').select('id, nombre, ciclo'),
    supabase.from('aulas').select('id, nombre, codigo'),
    supabase.from('grupos').select('id, curso_id, nombre'),
  ]);

  const cursoIdToName = new Map<string, string>();
  const cursoIdToCiclo = new Map<string, string>();
  (cursosRes.data ?? []).forEach((c) => {
    cursoIdToName.set(c.id, c.nombre);
    cursoIdToCiclo.set(c.id, c.ciclo);
  });

  const cursoNames: Record<string, string> = {};
  const grupoCiclos: Record<string, string> = {};
  (gruposRes.data ?? []).forEach((g) => {
    const cursoNombre = cursoIdToName.get(g.curso_id);
    cursoNames[g.id] = cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre;
    const ciclo = cursoIdToCiclo.get(g.curso_id);
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

  debugInfo.actividadesNoLectivas = actividadesNoLectivas?.length || 0;

  return {
    data: {
      periodoId: periodoData.id,
      periodoName: periodoData.name,
      horarioEstado: horarioData?.estado || 'Pendiente',
      asignaciones,
      cursoNames,
      aulaNames,
      grupoCiclos,
      actividadesNoLectivas: actividadesNoLectivas ?? [],
    },
    debug: debugInfo,
  };
}
