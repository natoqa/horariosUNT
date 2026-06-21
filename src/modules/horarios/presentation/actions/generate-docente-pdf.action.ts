'use server';

import { createClient } from '@/shared/lib/supabase/server';
import {
  GenerateDocentePdfUseCase,
  DocentePdfAsignacion,
  DocentePdfNameMaps,
} from '../../application/use-cases/generate-docente-pdf.use-case';

interface GenerateDocentePdfResult {
  pdfBase64?: string;
  fileName?: string;
  message?: string;
}

export async function generateDocentePdfAction(): Promise<GenerateDocentePdfResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'docente') {
    return { message: 'Solo los docentes pueden descargar su horario individual.' };
  }

  // Find published/approved periodo
  const { data: periodoData } = await supabase
    .from('periodos')
    .select('id, name, state')
    .in('state', ['Aprobado', 'Publicado', 'Cerrado'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!periodoData) {
    return { message: 'No hay un horario publicado disponible.' };
  }

  // Find horario
  const { data: horarioData } = await supabase
    .from('horarios')
    .select('id')
    .eq('periodo_id', periodoData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!horarioData) {
    return { message: 'No hay horario generado para el período actual.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id, nombres, apellidos, escuela')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un registro de docente asociado a este usuario.' };
  }

  // Get docente assignments
  const { data: rawAsignaciones } = await supabase
    .from('asignaciones')
    .select('grupo_id, aula_id, dia, bloque, tipo_sesion')
    .eq('horario_id', horarioData.id)
    .eq('docente_id', docenteData.id);

  // Get actividades no lectivas for the docente
  const { data: actividadesNoLectivas } = await supabase
    .from('actividades_no_lectivas')
    .select('tipo, horas, detalles, dia, bloque')
    .eq('docente_id', docenteData.id)
    .eq('periodo_id', periodoData.id);

  if (!rawAsignaciones || rawAsignaciones.length === 0) {
    return { message: 'No tienes asignaciones en el horario actual.' };
  }

  // Load name maps
  const [cursosRes, aulasRes, gruposRes] = await Promise.all([
    supabase.from('cursos').select('id, nombre, ciclo, creditos, horas_teoricas, horas_practicas'),
    supabase.from('aulas').select('id, nombre, codigo'),
    supabase.from('grupos').select('id, curso_id, nombre'),
  ]);

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
  (aulasRes.data ?? []).forEach((a) => {
    aulaNames.set(a.id, `${a.codigo} - ${a.nombre}`);
  });

  const docenteName = docenteData
    ? `${docenteData.apellidos}, ${docenteData.nombres}`
    : user.user_metadata?.full_name ?? user.email ?? 'Docente';

  const asignaciones: DocentePdfAsignacion[] = rawAsignaciones.map((a) => ({
    grupoId: a.grupo_id,
    aulaId: a.aula_id,
    dia: a.dia,
    bloque: a.bloque,
    tipo: a.tipo_sesion,
  }));

  const actividadesNoLectivasData = (actividadesNoLectivas ?? []).map((act) => ({
    tipo: act.tipo,
    horas: act.horas,
    detalles: act.detalles,
    dia: act.dia,
    bloque: act.bloque,
  }));

  const docenteEscuelas = new Map<string, string>();
  if (docenteData && docenteData.id) {
    docenteEscuelas.set(docenteData.id, docenteData.escuela ?? '');
  }

  const nameMaps: DocentePdfNameMaps = {
    cursos: cursoNames,
    aulas: aulaNames,
    grupoCiclos,
    docenteEscuelas,
    cursoCreditos,
    cursoHoras,
    grupoCursoId,
  };

  const useCase = new GenerateDocentePdfUseCase();
  const pdfBytes = await useCase.execute(asignaciones, nameMaps, periodoData.name, docenteName, actividadesNoLectivasData);

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  const fileName = `mi-horario-${periodoData.name.replace(/\s+/g, '-')}.pdf`;

  return { pdfBase64, fileName };
}
