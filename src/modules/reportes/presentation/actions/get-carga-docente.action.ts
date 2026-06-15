'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { getCargaDocenteSchema } from '../../application/dtos/get-carga-docente.dto';

export interface CargaDocenteRow {
  docenteId: string;
  nombre: string;
  categoria: string;
  regimen: string;
  horasAsignadas: number;
  horasMaximas: number;
  porcentaje: number;
  cursos: string;
}

interface GetCargaDocenteResult {
  data?: CargaDocenteRow[];
  periodoName?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function getCargaDocenteAction(
  data: Record<string, unknown>,
): Promise<GetCargaDocenteResult> {
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

  const [asignacionesRes, docentesRes, gruposRes, cursosRes] = await Promise.all([
    supabase.from('asignaciones').select('docente_id, grupo_id').eq('horario_id', horario.id),
    supabase.from('docentes').select('id, nombres, apellidos, categoria, regimen, carga_maxima'),
    supabase.from('grupos').select('id, curso_id, nombre'),
    supabase.from('cursos').select('id, nombre'),
  ]);

  const asignaciones = asignacionesRes.data ?? [];
  const docentes = docentesRes.data ?? [];
  const grupos = gruposRes.data ?? [];
  const cursos = cursosRes.data ?? [];

  const cursoNameMap: Record<string, string> = {};
  cursos.forEach((c) => cursoNameMap[c.id] = c.nombre);

  const grupoToCursoName: Record<string, string> = {};
  const grupoToGrupoName: Record<string, string> = {};
  grupos.forEach((g) => {
    grupoToCursoName[g.id] = cursoNameMap[g.curso_id] ?? '';
    grupoToGrupoName[g.id] = g.nombre;
  });

  const horasPorDocente: Record<string, number> = {};
  const cursosPorDocente: Record<string, string[]> = {};
  for (const a of asignaciones) {
    horasPorDocente[a.docente_id] = (horasPorDocente[a.docente_id] ?? 0) + 1;

    const cursoNombre = grupoToCursoName[a.grupo_id] ?? '';
    const grupoNombre = grupoToGrupoName[a.grupo_id] ?? '';
    const label = cursoNombre ? `${cursoNombre} (${grupoNombre})` : grupoNombre;

    if (!cursosPorDocente[a.docente_id]) {
      cursosPorDocente[a.docente_id] = [];
    }
    if (!cursosPorDocente[a.docente_id].includes(label)) {
      cursosPorDocente[a.docente_id].push(label);
    }
  }

  const rows: CargaDocenteRow[] = docentes.map((d) => {
    const horas = horasPorDocente[d.id] ?? 0;
    const maximas = d.carga_maxima ?? 0;
    const porcentaje = maximas > 0 ? Math.round((horas / maximas) * 100) : 0;
    const cursosArr = cursosPorDocente[d.id] || [];
    const cursosStr = cursosArr.join(', ');

    return {
      docenteId: d.id,
      nombre: `${d.apellidos}, ${d.nombres}`,
      categoria: d.categoria ?? '',
      regimen: d.regimen ?? '',
      horasAsignadas: horas,
      horasMaximas: maximas,
      porcentaje,
      cursos: cursosStr,
    };
  });

  rows.sort((a, b) => b.porcentaje - a.porcentaje);

  return { data: rows, periodoName: periodo.name };
}
