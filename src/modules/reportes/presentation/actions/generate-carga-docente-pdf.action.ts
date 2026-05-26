'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { getCargaDocenteSchema } from '../../application/dtos/get-carga-docente.dto';
import {
  GenerateCargaDocentePdfUseCase,
  CargaDocentePdfRow,
} from '../../application/use-cases/generate-carga-docente-pdf.use-case';

interface GenerateCargaDocentePdfResult {
  pdfBase64?: string;
  fileName?: string;
  message?: string;
}

export async function generateCargaDocentePdfAction(
  data: Record<string, unknown>,
): Promise<GenerateCargaDocentePdfResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el director o la secretaria pueden generar este reporte.' };
  }

  const validated = getCargaDocenteSchema.safeParse(data);
  if (!validated.success) {
    return { message: 'ID de periodo invalido.' };
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

  const cursoNameMap = new Map<string, string>();
  cursos.forEach((c) => cursoNameMap.set(c.id, c.nombre));

  const grupoToCursoName = new Map<string, string>();
  const grupoToGrupoName = new Map<string, string>();
  grupos.forEach((g) => {
    grupoToCursoName.set(g.id, cursoNameMap.get(g.curso_id) ?? '');
    grupoToGrupoName.set(g.id, g.nombre);
  });

  const horasPorDocente = new Map<string, number>();
  const cursosPorDocente = new Map<string, Set<string>>();
  for (const a of asignaciones) {
    horasPorDocente.set(a.docente_id, (horasPorDocente.get(a.docente_id) ?? 0) + 1);

    const cursoNombre = grupoToCursoName.get(a.grupo_id) ?? '';
    const grupoNombre = grupoToGrupoName.get(a.grupo_id) ?? '';
    const label = cursoNombre ? `${cursoNombre} (${grupoNombre})` : grupoNombre;

    if (!cursosPorDocente.has(a.docente_id)) {
      cursosPorDocente.set(a.docente_id, new Set());
    }
    cursosPorDocente.get(a.docente_id)!.add(label);
  }

  const rows: CargaDocentePdfRow[] = docentes.map((d) => {
    const horas = horasPorDocente.get(d.id) ?? 0;
    const maximas = d.carga_maxima ?? 0;
    const porcentaje = maximas > 0 ? Math.round((horas / maximas) * 100) : 0;
    const cursosSet = cursosPorDocente.get(d.id);
    const cursosStr = cursosSet ? Array.from(cursosSet).join(', ') : '';

    return {
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

  const useCase = new GenerateCargaDocentePdfUseCase();
  const pdfBytes = await useCase.execute(rows, periodo.name);

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  const fileName = `carga-docente-${periodo.name.replace(/\s+/g, '-')}.pdf`;

  return { pdfBase64, fileName };
}
