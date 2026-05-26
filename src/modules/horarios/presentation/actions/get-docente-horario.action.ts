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
}

interface GetDocenteHorarioResult {
  data?: DocenteHorarioData;
  message?: string;
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

  // Find an active periodo with a horario (Aprobado, Publicado, or Cerrado)
  const { data: periodoData } = await supabase
    .from('periodos')
    .select('id, name, state')
    .in('state', ['Aprobado', 'Publicado', 'Cerrado'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!periodoData) {
    return { message: 'No hay un horario publicado disponible para consultar.' };
  }

  // Find the latest horario for this periodo
  const { data: horarioData } = await supabase
    .from('horarios')
    .select('id, estado')
    .eq('periodo_id', periodoData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!horarioData) {
    return { message: 'No hay un horario generado para el período actual.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un registro de docente asociado a este usuario.' };
  }

  // Get all assignments for this horario filtered by the docente
  const { data: rawAsignaciones } = await supabase
    .from('asignaciones')
    .select('id, horario_id, grupo_id, docente_id, aula_id, dia, bloque, tipo, created_at')
    .eq('horario_id', horarioData.id)
    .eq('docente_id', docenteData.id);

  const asignaciones: Asignacion[] = (rawAsignaciones ?? []).map((a) => ({
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

  return {
    data: {
      periodoId: periodoData.id,
      periodoName: periodoData.name,
      horarioEstado: horarioData.estado,
      asignaciones,
      cursoNames,
      aulaNames,
      grupoCiclos,
    },
  };
}
