'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { getCargaDocenteSchema } from '../../application/dtos/get-carga-docente.dto';
import {
  GenerateOcupacionAulasPdfUseCase,
  OcupacionAulaPdfSlot,
} from '../../application/use-cases/generate-ocupacion-aulas-pdf.use-case';
import { z } from 'zod';

const generateOcupacionPdfSchema = getCargaDocenteSchema.extend({
  aulaId: z.string().uuid('ID de aula invalido'),
});

const TOTAL_BLOQUES = DIAS_SEMANA.length * BLOQUES_HORARIOS.length;

interface GenerateOcupacionPdfResult {
  pdfBase64?: string;
  fileName?: string;
  message?: string;
}

export async function generateOcupacionAulasPdfAction(
  data: Record<string, unknown>,
): Promise<GenerateOcupacionPdfResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el director o la secretaria pueden generar este reporte.' };
  }

  const validated = generateOcupacionPdfSchema.safeParse(data);
  if (!validated.success) {
    return { message: 'Datos invalidos.' };
  }

  const { periodoId, aulaId } = validated.data;

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

  const { data: aula, error: aulaError } = await supabase
    .from('aulas')
    .select('id, nombre, codigo')
    .eq('id', aulaId)
    .single();

  if (aulaError || !aula) {
    return { message: 'Aula no encontrada.' };
  }

  const [asignacionesRes, docentesRes, gruposRes, cursosRes] = await Promise.all([
    supabase.from('asignaciones').select('docente_id, grupo_id, aula_id, dia, bloque').eq('horario_id', horario.id).eq('aula_id', aulaId),
    supabase.from('docentes').select('id, nombres, apellidos'),
    supabase.from('grupos').select('id, curso_id, nombre'),
    supabase.from('cursos').select('id, nombre'),
  ]);

  const asignaciones = asignacionesRes.data ?? [];
  const docentes = docentesRes.data ?? [];
  const grupos = gruposRes.data ?? [];
  const cursos = cursosRes.data ?? [];

  const docenteNameMap = new Map<string, string>();
  docentes.forEach((d) => docenteNameMap.set(d.id, `${d.apellidos}, ${d.nombres}`));

  const cursoNameMap = new Map<string, string>();
  cursos.forEach((c) => cursoNameMap.set(c.id, c.nombre));

  const grupoToCursoName = new Map<string, string>();
  grupos.forEach((g) => {
    const cursoNombre = cursoNameMap.get(g.curso_id) ?? '';
    grupoToCursoName.set(g.id, cursoNombre ? `${cursoNombre} (${g.nombre})` : g.nombre);
  });

  const slots: OcupacionAulaPdfSlot[] = asignaciones.map((a) => ({
    dia: a.dia as DiaSemana,
    bloque: a.bloque as BloqueHorario,
    curso: grupoToCursoName.get(a.grupo_id) ?? '',
    docente: docenteNameMap.get(a.docente_id) ?? '',
  }));

  const aulaName = `${aula.codigo} - ${aula.nombre}`;
  const porcentaje = TOTAL_BLOQUES > 0
    ? Math.round((asignaciones.length / TOTAL_BLOQUES) * 100)
    : 0;

  const useCase = new GenerateOcupacionAulasPdfUseCase();
  const pdfBytes = await useCase.execute(aulaName, slots, porcentaje, periodo.name);

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  const fileName = `ocupacion-${aula.codigo}-${periodo.name.replace(/\s+/g, '-')}.pdf`;

  return { pdfBase64, fileName };
}
