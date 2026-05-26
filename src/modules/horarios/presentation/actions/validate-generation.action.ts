'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { ValidatePreGenerationUseCase, PreValidationResult } from '../../application/use-cases/validate-pre-generation.use-case';
import { Periodo } from '@/modules/periodos';
import { Docente } from '@/modules/docentes';
import { Curso, Grupo } from '@/modules/cursos';
import { Aula } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';

export async function validateGenerationAction(
  periodoId: string,
  forceWithoutFullAvailability: boolean = false,
): Promise<{ data?: PreValidationResult; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director') {
    return { message: 'Solo el Director puede validar la generación de horarios.' };
  }

  try {
    const [periodoRes, docentesRes, cursosRes, gruposRes, aulasRes, disponibilidadRes] =
      await Promise.all([
        supabase.from('periodos').select('*').eq('id', periodoId).single(),
        supabase.from('docentes').select('*').eq('estado', 'Activo'),
        supabase.from('cursos').select('*').eq('estado', 'Activo'),
        supabase.from('grupos').select('*').eq('periodo_id', periodoId),
        supabase.from('aulas').select('*').eq('estado', 'Activa'),
        supabase.from('disponibilidad').select('*').eq('periodo_id', periodoId),
      ]);

    if (periodoRes.error || !periodoRes.data) {
      return { message: 'No se encontró el período indicado.' };
    }

    const periodo: Periodo = {
      id: periodoRes.data.id,
      name: periodoRes.data.name,
      tipoCiclo: periodoRes.data.tipo_ciclo,
      startDate: periodoRes.data.start_date,
      endDate: periodoRes.data.end_date,
      availabilityDeadline: periodoRes.data.availability_deadline,
      state: periodoRes.data.state,
      createdAt: periodoRes.data.created_at,
      updatedAt: periodoRes.data.updated_at,
    };

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
      docenteId: g.docente_id ?? null, nombre: g.nombre, numEstudiantes: g.num_estudiantes,
      createdAt: g.created_at, updatedAt: g.updated_at,
    }));

    const aulas: Aula[] = (aulasRes.data ?? []).map((a) => ({
      id: a.id, codigo: a.codigo, nombre: a.nombre, pabellon: a.pabellon,
      piso: a.piso, capacidad: a.capacidad, tipo: a.tipo,
      equipamiento: a.equipamiento ?? [], estado: a.estado,
      createdAt: a.created_at, updatedAt: a.updated_at,
    }));

    const disponibilidades: Disponibilidad[] = (disponibilidadRes.data ?? []).map((d) => ({
      id: d.id, docenteId: d.docente_id, periodoId: d.periodo_id,
      dia: d.dia, bloque: d.bloque, estado: d.estado,
      createdAt: d.created_at, updatedAt: d.updated_at,
    }));

    const useCase = new ValidatePreGenerationUseCase();
    const result = useCase.execute(
      periodo, docentes, cursos, grupos, aulas, disponibilidades,
      forceWithoutFullAvailability,
    );

    return { data: result };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al validar.' };
  }
}
