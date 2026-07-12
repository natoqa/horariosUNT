'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { generatePdfSchema } from '../../application/dtos/generate-pdf.dto';
import { GenerateHorarioPdfUseCase, PdfAsignacion, PdfNameMaps } from '../../application/use-cases/generate-horario-pdf.use-case';
import { ReportConfig, ReportFilterType } from '../../domain/entities/report-config.entity';

interface GeneratePdfActionResult {
  pdfBase64?: string;
  fileName?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function generatePdfAction(
  data: Record<string, unknown>,
): Promise<GeneratePdfActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el director o la secretaria pueden generar reportes.' };
  }

  const validated = generatePdfSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const { periodoId, filterType, filterId } = validated.data;

  const { data: periodo, error: periodoError } = await supabase
    .from('periodos')
    .select('id, name, state')
    .eq('id', periodoId)
    .single();

  if (periodoError || !periodo) {
    return { message: 'Período no encontrado.' };
  }

  if (periodo.state !== 'Aprobado' && periodo.state !== 'Publicado' && periodo.state !== 'Cerrado') {
    return { message: 'Solo se pueden generar reportes de períodos aprobados, publicados o cerrados.' };
  }

  const { data: horario, error: horarioError } = await supabase
    .from('horarios')
    .select('id')
    .eq('periodo_id', periodoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (horarioError || !horario) {
    return { message: 'No hay horario generado para este período.' };
  }

  const { data: rawAsignaciones } = await supabase
    .from('asignaciones')
    .select('id, grupo_id, docente_id, aula_id, dia, bloque, tipo')
    .eq('horario_id', horario.id);

  if (!rawAsignaciones || rawAsignaciones.length === 0) {
    return { message: 'El horario no tiene asignaciones.' };
  }

  const [docentesRes, cursosRes, aulasRes, gruposRes] = await Promise.all([
    supabase.from('docentes').select('id, nombres, apellidos, escuela'),
    supabase.from('cursos').select('id, nombre, ciclo, creditos, horas_teoricas, horas_practicas'),
    supabase.from('aulas').select('id, nombre, codigo'),
    supabase.from('grupos').select('id, curso_id, nombre'),
  ]);

  const docenteNames = new Map<string, string>();
  const docenteEscuelas = new Map<string, string>();
  (docentesRes.data ?? []).forEach((d) => {
    docenteNames.set(d.id, `${d.apellidos}, ${d.nombres}`);
    docenteEscuelas.set(d.id, d.escuela ?? '');
  });

  const cursoIdToName: Record<string, string> = {};
  const cursoIdToCiclo: Record<string, string> = {};
  const cursoCreditos = new Map<string, number>();
  const cursoHoras = new Map<string, number>();
  (cursosRes.data ?? []).forEach((c) => {
    cursoIdToName[c.id] = c.nombre;
    cursoIdToCiclo[c.id] = c.ciclo;
    cursoCreditos.set(c.id, c.creditos ?? 0);
    cursoHoras.set(c.id, (c.horas_teoricas ?? 0) + (c.horas_practicas ?? 0));
  });

  const cursoNames = new Map<string, string>();
  const grupoCiclos = new Map<string, string>();
  const grupoCursoId = new Map<string, string>();
  (gruposRes.data ?? []).forEach((g) => {
    const cursoNombre = cursoIdToName[g.curso_id];
    cursoNames.set(g.id, cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre);
    const ciclo = cursoIdToCiclo[g.curso_id];
    if (ciclo) grupoCiclos.set(g.id, ciclo);
    grupoCursoId.set(g.id, g.curso_id);
  });

  const aulaNames = new Map<string, string>();
  (aulasRes.data ?? []).forEach((a) => aulaNames.set(a.id, `${a.codigo} - ${a.nombre}`));

  let asignaciones: PdfAsignacion[] = rawAsignaciones.map((a) => ({
    grupoId: a.grupo_id,
    docenteId: a.docente_id,
    aulaId: a.aula_id,
    dia: a.dia,
    bloque: a.bloque,
    tipo: a.tipo,
  }));

  let filterLabel = 'Horario completo';

  if (filterType === 'ciclo' && filterId) {
    asignaciones = asignaciones.filter((a) => grupoCiclos.get(a.grupoId) === filterId);
    filterLabel = `Ciclo ${filterId}`;
  } else if (filterType === 'docente' && filterId) {
    asignaciones = asignaciones.filter((a) => a.docenteId === filterId);
    filterLabel = `Docente: ${docenteNames.get(filterId) ?? filterId}`;
  } else if (filterType === 'aula' && filterId) {
    asignaciones = asignaciones.filter((a) => a.aulaId === filterId);
    filterLabel = `Aula: ${aulaNames.get(filterId) ?? filterId}`;
  }

  if (asignaciones.length === 0) {
    return { message: 'No hay asignaciones para el filtro seleccionado.' };
  }

  const nameMaps: PdfNameMaps = {
    docentes: docenteNames,
    cursos: cursoNames,
    aulas: aulaNames,
    grupoCiclos,
    docenteEscuelas,
    cursoCreditos,
    cursoHoras,
    grupoCursoId,
  };

  const config: ReportConfig = {
    periodoId,
    filterType: filterType as ReportFilterType,
    filterId,
    periodoName: periodo.name,
  };

  const useCase = new GenerateHorarioPdfUseCase();
  const pdfBytes = await useCase.execute(asignaciones, nameMaps, config, filterLabel);

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  const sanitizedFilter = filterType === 'all' ? 'completo' : `${filterType}-${filterId ?? ''}`;
  const fileName = `horario-${periodo.name.replace(/\s+/g, '-')}-${sanitizedFilter}.pdf`;

  return { pdfBase64, fileName };
}
