'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { getCargaDocenteSchema } from '../../application/dtos/get-carga-docente.dto';

export interface OcupacionSlot {
  dia: DiaSemana;
  bloque: BloqueHorario;
  curso: string;
  docente: string;
}

export interface AulaResumen {
  aulaId: string;
  aulaName: string;
  porcentaje: number;
  bloquesOcupados: number;
  bloquesTotales: number;
}

interface GetOcupacionAulaResult {
  aulas?: AulaResumen[];
  slots?: OcupacionSlot[];
  aulaName?: string;
  porcentaje?: number;
  periodoName?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const TOTAL_BLOQUES = DIAS_SEMANA.length * BLOQUES_HORARIOS.length;

export async function getOcupacionAulaAction(
  data: Record<string, unknown>,
): Promise<GetOcupacionAulaResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el director o la secretaria pueden ver este reporte.' };
  }

  const validated = getCargaDocenteSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const { periodoId } = validated.data;

  const { data: periodo, error: periodoError } = await supabase
    .from('periodos')
    .select('id, name, state')
    .eq('id', periodoId)
    .single();

  if (periodoError || !periodo) {
    return { message: 'Periodo no encontrado.' };
  }

  if (periodo.state !== 'Aprobado' && periodo.state !== 'Publicado' && periodo.state !== 'Cerrado') {
    return { message: 'Solo se pueden generar reportes de periodos aprobados, publicados o cerrados.' };
  }

  const { data: horario, error: horarioError } = await supabase
    .from('horarios')
    .select('id')
    .eq('periodo_id', periodoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (horarioError || !horario) {
    return { message: 'No hay horario generado para este periodo.' };
  }

  const [asignacionesRes, docentesRes, gruposRes, cursosRes, aulasRes] = await Promise.all([
    supabase.from('asignaciones').select('docente_id, grupo_id, aula_id, dia, bloque').eq('horario_id', horario.id),
    supabase.from('docentes').select('id, nombres, apellidos'),
    supabase.from('grupos').select('id, curso_id, nombre'),
    supabase.from('cursos').select('id, nombre'),
    supabase.from('aulas').select('id, nombre, codigo'),
  ]);

  const asignaciones = asignacionesRes.data ?? [];
  const docentes = docentesRes.data ?? [];
  const grupos = gruposRes.data ?? [];
  const cursos = cursosRes.data ?? [];
  const aulasRaw = aulasRes.data ?? [];

  const docenteNameMap = new Map<string, string>();
  docentes.forEach((d) => docenteNameMap.set(d.id, `${d.apellidos}, ${d.nombres}`));

  const cursoNameMap = new Map<string, string>();
  cursos.forEach((c) => cursoNameMap.set(c.id, c.nombre));

  const grupoToCursoName = new Map<string, string>();
  grupos.forEach((g) => {
    const cursoNombre = cursoNameMap.get(g.curso_id) ?? '';
    grupoToCursoName.set(g.id, cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre);
  });

  const aulaNameMap = new Map<string, string>();
  aulasRaw.forEach((a) => aulaNameMap.set(a.id, `${a.codigo} - ${a.nombre}`));

  const aulaId = typeof data.aulaId === 'string' && data.aulaId ? data.aulaId : undefined;

  if (aulaId) {
    const aulaName = aulaNameMap.get(aulaId) ?? 'Aula desconocida';
    const aulaAsignaciones = asignaciones.filter((a) => a.aula_id === aulaId);

    const slots: OcupacionSlot[] = aulaAsignaciones.map((a) => ({
      dia: a.dia as DiaSemana,
      bloque: a.bloque as BloqueHorario,
      curso: grupoToCursoName.get(a.grupo_id) ?? '',
      docente: docenteNameMap.get(a.docente_id) ?? '',
    }));

    const porcentaje = TOTAL_BLOQUES > 0
      ? Math.round((aulaAsignaciones.length / TOTAL_BLOQUES) * 100)
      : 0;

    return { slots, aulaName, porcentaje, periodoName: periodo.name };
  }

  const bloquesPorAula = new Map<string, number>();
  for (const a of asignaciones) {
    bloquesPorAula.set(a.aula_id, (bloquesPorAula.get(a.aula_id) ?? 0) + 1);
  }

  const aulas: AulaResumen[] = aulasRaw.map((aula) => {
    const ocupados = bloquesPorAula.get(aula.id) ?? 0;
    return {
      aulaId: aula.id,
      aulaName: `${aula.codigo} - ${aula.nombre}`,
      porcentaje: TOTAL_BLOQUES > 0 ? Math.round((ocupados / TOTAL_BLOQUES) * 100) : 0,
      bloquesOcupados: ocupados,
      bloquesTotales: TOTAL_BLOQUES,
    };
  });

  aulas.sort((a, b) => b.porcentaje - a.porcentaje);

  return { aulas, periodoName: periodo.name };
}
