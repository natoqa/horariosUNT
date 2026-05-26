'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { GenerateHorarioUseCase, GenerateHorarioResult } from '../../application/use-cases/generate-horario.use-case';
import { Docente } from '@/modules/docentes';
import { Curso, Grupo } from '@/modules/cursos';
import { Aula, AulaRestriccion } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';
import { Horario, Asignacion, GenerationSummary } from '../../domain/entities/horario.entity';
import { UnassignedUnit } from '../../domain/services/schedule-generator.service';

export interface GenerateHorarioActionResult {
  horario?: Horario;
  asignaciones?: Asignacion[];
  summary?: GenerationSummary;
  unassigned?: UnassignedUnit[];
  message?: string;
}

export async function generateHorarioAction(
  periodoId: string,
): Promise<GenerateHorarioActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director') {
    return { message: 'Solo el Director puede generar horarios.' };
  }

  try {
    const [docentesRes, cursosRes, gruposRes, aulasRes, restriccionesRes, disponibilidadRes] =
      await Promise.all([
        supabase.from('docentes').select('*'),
        supabase.from('cursos').select('*'),
        supabase.from('grupos').select('*').eq('periodo_id', periodoId),
        supabase.from('aulas').select('*'),
        supabase.from('aula_restricciones').select('*'),
        supabase.from('disponibilidad').select('*').eq('periodo_id', periodoId),
      ]);

    const docentes: Docente[] = (docentesRes.data ?? []).map((d) => ({
      id: d.id, nombres: d.nombres, apellidos: d.apellidos, dni: d.dni,
      correo: d.correo, telefono: d.telefono, categoria: d.categoria,
      regimen: d.regimen, condicion: d.condicion, fechaIngreso: d.fecha_ingreso,
      cargaMaxima: d.carga_maxima, estado: d.estado,
      createdAt: d.created_at, updatedAt: d.updated_at,
    }));

    const cursos: Curso[] = (cursosRes.data ?? []).map((c) => ({
      id: c.id, codigo: c.codigo, nombre: c.nombre, ciclo: c.ciclo,
      tipo: c.tipo, horasTeoricas: c.horas_teoricas, horasPracticas: c.horas_practicas,
      creditos: c.creditos, requiereLaboratorio: c.requiere_laboratorio,
      tipoLaboratorio: c.tipo_laboratorio, estado: c.estado,
      createdAt: c.created_at, updatedAt: c.updated_at,
    }));

    const grupos: Grupo[] = (gruposRes.data ?? []).map((g) => ({
      id: g.id, cursoId: g.curso_id, periodoId: g.periodo_id,
      nombre: g.nombre, numEstudiantes: g.num_estudiantes,
      createdAt: g.created_at, updatedAt: g.updated_at,
    }));

    const aulas: Aula[] = (aulasRes.data ?? []).map((a) => ({
      id: a.id, codigo: a.codigo, nombre: a.nombre, pabellon: a.pabellon,
      piso: a.piso, capacidad: a.capacidad, tipo: a.tipo,
      equipamiento: a.equipamiento ?? [], estado: a.estado,
      createdAt: a.created_at, updatedAt: a.updated_at,
    }));

    const restriccionesAula: AulaRestriccion[] = (restriccionesRes.data ?? []).map((r) => ({
      id: r.id, aulaId: r.aula_id, dia: r.dia, bloque: r.bloque,
      motivo: r.motivo, createdAt: r.created_at,
    }));

    const disponibilidades: Disponibilidad[] = (disponibilidadRes.data ?? []).map((d) => ({
      id: d.id, docenteId: d.docente_id, periodoId: d.periodo_id,
      dia: d.dia, bloque: d.bloque, estado: d.estado,
      createdAt: d.created_at, updatedAt: d.updated_at,
    }));

    const repo = new SupabaseHorarioRepository();
    const useCase = new GenerateHorarioUseCase(repo);

    const result: GenerateHorarioResult = await useCase.execute(periodoId, {
      docentes, cursos, grupos, aulas, disponibilidades, restriccionesAula,
    });

    revalidatePath('/director/horarios');
    return {
      horario: result.horario,
      asignaciones: result.asignaciones,
      summary: result.generationResult.summary,
      unassigned: result.generationResult.unassigned,
    };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al generar horario.' };
  }
}
