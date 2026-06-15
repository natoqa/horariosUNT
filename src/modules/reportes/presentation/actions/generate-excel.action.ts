'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { generateExcelSchema } from '../../application/dtos/generate-excel.dto';
import {
  GenerateHorarioExcelUseCase,
  ExcelAsignacion,
  ExcelNameMaps,
  ExcelDocenteInfo,
  ExcelAulaInfo,
} from '../../application/use-cases/generate-horario-excel.use-case';

interface GenerateExcelActionResult {
  excelBase64?: string;
  fileName?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function generateExcelAction(
  data: Record<string, unknown>,
): Promise<GenerateExcelActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el director o la secretaria pueden generar reportes Excel.' };
  }

  const validated = generateExcelSchema.safeParse(data);
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

  const { data: rawAsignaciones } = await supabase
    .from('asignaciones')
    .select('id, grupo_id, docente_id, aula_id, dia, bloque, tipo')
    .eq('horario_id', horario.id);

  if (!rawAsignaciones || rawAsignaciones.length === 0) {
    return { message: 'El horario no tiene asignaciones.' };
  }

  const [docentesRes, cursosRes, aulasRes, gruposRes] = await Promise.all([
    supabase.from('docentes').select('id, nombres, apellidos, categoria, regimen, carga_maxima'),
    supabase.from('cursos').select('id, nombre, ciclo'),
    supabase.from('aulas').select('id, nombre, codigo'),
    supabase.from('grupos').select('id, curso_id, nombre'),
  ]);

  const docenteNames: Record<string, string> = {};
  const docenteInfos: ExcelDocenteInfo[] = [];
  (docentesRes.data ?? []).forEach((d) => {
    const nombre = `${d.apellidos}, ${d.nombres}`;
    docenteNames[d.id] = nombre;
    docenteInfos.push({
      id: d.id,
      nombre,
      categoria: d.categoria ?? '',
      regimen: d.regimen ?? '',
      cargaMaxima: d.carga_maxima ?? 0,
    });
  });

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
  const aulaInfos: ExcelAulaInfo[] = [];
  (aulasRes.data ?? []).forEach((a) => {
    const nombre = `${a.codigo} - ${a.nombre}`;
    aulaNames[a.id] = nombre;
    aulaInfos.push({ id: a.id, nombre });
  });

  const asignaciones: ExcelAsignacion[] = rawAsignaciones.map((a) => ({
    grupoId: a.grupo_id,
    docenteId: a.docente_id,
    aulaId: a.aula_id,
    dia: a.dia,
    bloque: a.bloque,
    tipo: a.tipo,
  }));

  const nameMaps: ExcelNameMaps = {
    docentes: docenteNames,
    cursos: cursoNames,
    aulas: aulaNames,
    grupoCiclos,
  };

  const useCase = new GenerateHorarioExcelUseCase();
  const buffer = await useCase.execute(asignaciones, nameMaps, docenteInfos, aulaInfos, periodo.name);

  const excelBase64 = buffer.toString('base64');
  const fileName = `horario-${periodo.name.replace(/\s+/g, '-')}.xlsx`;

  return { excelBase64, fileName };
}
