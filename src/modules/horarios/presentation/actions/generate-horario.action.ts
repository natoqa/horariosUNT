'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/shared/lib/logger';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { GenerateHorarioUseCase, GenerateHorarioResult } from '../../application/use-cases/generate-horario.use-case';
import { Docente } from '@/modules/docentes';
import { Curso, Grupo } from '@/modules/cursos';
import { Aula, AulaRestriccion } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';
import { Horario, Asignacion, GenerationSummary } from '../../domain/entities/horario.entity';
import { UnassignedUnit } from '../../domain/services/schedule-generator.service';
import { getCiclosByTipo } from '@/modules/periodos/domain/entities/periodo.entity';
import { distribuirActividadesNoLectivas } from '@/modules/carga-no-lectiva/domain/services/actividades-no-lectiva-distributor.service';

export interface GenerateHorarioActionResult {
  horario?: Horario;
  asignaciones?: Asignacion[];
  summary?: GenerationSummary;
  unassigned?: UnassignedUnit[];
  message?: string;
}

export async function generateHorarioAction(
  periodoId: string,
  planEstudioId?: string,
): Promise<GenerateHorarioActionResult> {
  logger.debug('GENERATE', 'generateHorarioAction called with periodoId:', periodoId);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.debug('GENERATE', 'No user found');
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  logger.debug('GENERATE', 'User role:', role);
  if (role !== 'director' && role !== 'secretaria') {
    logger.debug('GENERATE', 'User not director or secretaria');
    return { message: 'Solo el Director o la Secretaria pueden generar horarios.' };
  }

  try {
    // Obtener información del período para determinar ciclos
    const { data: periodo } = await supabase
      .from('periodos')
      .select('tipo_ciclo')
      .eq('id', periodoId)
      .single();

    const tipoCiclo = periodo?.tipo_ciclo || 'Impar';
    const ciclosPermitidos = getCiclosByTipo(tipoCiclo);

    let cursosQuery = supabase.from('cursos').select('*');
    if (planEstudioId) {
      cursosQuery = cursosQuery.eq('plan_estudio_id', planEstudioId);
    }

    const [docentesRes, cursosRes, gruposRes, aulasRes, restriccionesRes, disponibilidadRes] =
      await Promise.all([
        supabase.from('docentes').select('*'),
        cursosQuery,
        supabase.from('grupos').select('*').eq('periodo_id', periodoId),
        supabase.from('aulas').select('*'),
        supabase.from('aula_restricciones').select('*'),
        supabase.from('disponibilidad').select('*').eq('periodo_id', periodoId),
      ]);

    // Validation checks
    if (!gruposRes.data || gruposRes.data.length === 0) {
      return { message: 'No hay grupos/secciones registrados para este período. Primero cree grupos para los cursos.' };
    }

    if (!docentesRes.data || docentesRes.data.length === 0) {
      return { message: 'No hay docentes registrados en el sistema.' };
    }

    if (!aulasRes.data || aulasRes.data.length === 0) {
      return { message: 'No hay aulas registradas en el sistema.' };
    }

    // Validación de carga no lectiva para docentes asignados
    const docentesAsignados = Array.from(new Set(
      gruposRes.data
        .filter((g) => g.docente_id)
        .map((g) => g.docente_id)
    ));

    if (docentesAsignados.length === 0) {
      return { message: 'No hay docentes asignados a los grupos. Asigne docentes a los grupos antes de generar horarios.' };
    }

    const { data: cargasNoLectivas } = await supabase
      .from('cargas_no_lectivas')
      .select('docente_id, total_horas, estado, director_aprobado, secretaria_aprobado')
      .eq('periodo_id', periodoId);

    const docentesConCarga = new Set(cargasNoLectivas?.map((c) => c.docente_id) || []);
    const docentesSinCarga = docentesAsignados.filter((id) => !docentesConCarga.has(id));

    if (docentesSinCarga.length > 0) {
      return { 
        message: `Faltan ${docentesSinCarga.length} docente(s) asignado(s) que no han registrado su carga no lectiva. Todos los docentes asignados deben registrar su carga no lectiva antes de generar horarios.` 
      };
    }

    const docentesConCargaAprobada = cargasNoLectivas?.filter(
      (c) => c.director_aprobado && c.secretaria_aprobado
    ).map((c) => c.docente_id) || [];

    const docentesSinAprobacion = [...docentesAsignados].filter(
      (id) => !docentesConCargaAprobada.includes(id)
    );

    if (docentesSinAprobacion.length > 0) {
      return { 
        message: `Faltan ${docentesSinAprobacion.length} docente(s) asignado(s) cuya carga no lectiva no ha sido aprobada por el director y la secretaria. Todas las cargas deben estar aprobadas antes de generar horarios.` 
      };
    }

    const docentes: Docente[] = (docentesRes.data ?? []).map((d) => ({
      id: d.id, nombres: d.nombres, apellidos: d.apellidos, dni: d.dni,
      correo: d.correo, telefono: d.telefono, categoria: d.categoria,
      regimen: d.regimen, condicion: d.condicion, escuela: d.escuela,
      fechaIngreso: d.fecha_ingreso, cargaMaxima: d.carga_maxima, cargaElectiva: d.carga_electiva || 0, estado: d.estado,
      createdAt: d.created_at, updatedAt: d.updated_at,
    }));

    const cursos: Curso[] = (cursosRes.data ?? [])
      .filter((c) => ciclosPermitidos.includes(c.ciclo))
      .map((c) => ({
        id: c.id, codigo: c.codigo, nombre: c.nombre, ciclo: c.ciclo,
        tipo: c.tipo, horasTeoricas: c.horas_teoricas, horasPracticas: c.horas_practicas,
        creditos: c.creditos, requiereLaboratorio: c.requiere_laboratorio,
        tipoLaboratorio: c.tipo_laboratorio, estado: c.estado,
        planEstudioId: c.plan_estudio_id,
        createdAt: c.created_at, updatedAt: c.updated_at,
      }));

    const grupos: Grupo[] = (gruposRes.data ?? [])
      .filter((g) => {
        const curso = cursosRes.data?.find((c) => c.id === g.curso_id);
        return curso && ciclosPermitidos.includes(curso.ciclo);
      })
      .map((g) => ({
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

    const restriccionesAula: AulaRestriccion[] = (restriccionesRes.data ?? []).map((r) => ({
      id: r.id, aulaId: r.aula_id, dia: r.dia, bloque: r.bloque,
      motivo: r.motivo, createdAt: r.created_at,
    }));

    const disponibilidades: Disponibilidad[] = (disponibilidadRes.data ?? []).map((d) => {
      const estadoMap: Record<string, string> = {
        'Disponible': 'disponible',
        'No disponible': 'no_disponible',
        'Preferido': 'preferido',
      };
      return {
        id: d.id, docenteId: d.docente_id, periodoId: d.periodo_id,
        dia: d.dia, bloque: d.bloque,
        estado: (estadoMap[d.estado] || d.estado) as Disponibilidad['estado'],
        createdAt: d.created_at, updatedAt: d.updated_at,
      };
    });

    const activeDocentes = docentes.filter(d => d.estado === 'Activo');
    const activeAulas = aulas.filter(a => a.estado === 'Activa');

    if (activeDocentes.length === 0) {
      return { message: 'No hay docentes activos. Active al menos un docente para generar horarios.' };
    }

    if (activeAulas.length === 0) {
      return { message: 'No hay aulas activas. Active al menos un aula para generar horarios.' };
    }

    logger.debug('GENERATE', 'Data loaded:', {
      docentes: docentes.length,
      cursos: cursos.length,
      grupos: grupos.length,
      aulas: aulas.length,
      disponibilidades: disponibilidades.length,
      gruposConDocente: grupos.filter((g) => g.docenteId).length,
      disponibilidadEstados: [...new Set(disponibilidades.map((d) => d.estado))],
    });

    const repo = new SupabaseHorarioRepository();
    const useCase = new GenerateHorarioUseCase(repo);

    logger.debug('GENERATE', 'Calling useCase.execute...');
    const result: GenerateHorarioResult = await useCase.execute(periodoId, {
      docentes, cursos, grupos, aulas, disponibilidades, restriccionesAula,
    });

    logger.debug('GENERATE', 'Generation result:', {
      horarioId: result.horario?.id,
      asignacionesCount: result.asignaciones?.length,
      summary: result.generationResult.summary,
      unassignedCount: result.generationResult.unassigned?.length,
    });

    // Distribuir aleatoriamente las actividades no lectivas después de generar el horario
    logger.debug('GENERATE', 'Distribuyendo actividades no lectivas...');
    const { data: actividadesNoLectivas } = await supabase
      .from('actividades_no_lectivas')
      .select('id, tipo, horas, detalles, dia, bloque, docente_id')
      .eq('periodo_id', periodoId);

    if (actividadesNoLectivas && actividadesNoLectivas.length > 0) {
      // Agrupar actividades por docente
      const actividadesPorDocente: Record<string, any[]> = {};
      for (const actividad of actividadesNoLectivas) {
        const docenteId = actividad.docente_id;
        if (!actividadesPorDocente[docenteId]) {
          actividadesPorDocente[docenteId] = [];
        }
        actividadesPorDocente[docenteId].push(actividad);
      }

      // Distribuir actividades para cada docente
      const instanciasParaInsertar: any[] = [];
      const actividadesOriginalesParaEliminar: string[] = [];

      for (const docenteId in actividadesPorDocente) {
        const actividades = actividadesPorDocente[docenteId];
        const distribucionResult = distribuirActividadesNoLectivas(
          actividades,
          result.asignaciones || [],
          docenteId,
        );

        if (distribucionResult.success && distribucionResult.actividadesInstances) {
          logger.debug('GENERATE', `Distribución para docente ${docenteId}:`, distribucionResult.message);
          
          // Preparar instancias para insertar
          for (const instancia of distribucionResult.actividadesInstances) {
            instanciasParaInsertar.push({
              docente_id: docenteId,
              periodo_id: periodoId,
              tipo: instancia.tipo,
              horas: instancia.horas,
              detalles: instancia.detalles,
              dia: instancia.dia,
              bloque: instancia.bloque,
            });
          }

          // Marcar actividades originales para eliminar
          actividadesOriginalesParaEliminar.push(...actividades.map(a => a.id));
        }
      }

      // Insertar nuevas instancias solo si hay instancias para insertar
      if (instanciasParaInsertar.length > 0) {
        const { error: insertError } = await supabase
          .from('actividades_no_lectivas')
          .insert(instanciasParaInsertar);
        
        if (insertError) {
          logger.error('GENERATE', 'Error al insertar instancias:', insertError);
        } else {
          logger.debug('GENERATE', `Se insertaron ${instanciasParaInsertar.length} instancias de actividades no lectivas.`);
          
          // Solo eliminar actividades originales si la inserción fue exitosa
          if (actividadesOriginalesParaEliminar.length > 0) {
            await supabase
              .from('actividades_no_lectivas')
              .delete()
              .in('id', actividadesOriginalesParaEliminar);
            logger.debug('GENERATE', `Se eliminaron ${actividadesOriginalesParaEliminar.length} actividades originales.`);
          }
        }
      } else {
        logger.debug('GENERATE', 'No hay instancias para insertar, se preservan las actividades originales.');
      }
    }

    revalidatePath('/director/horarios');
    return {
      horario: result.horario,
      asignaciones: result.asignaciones,
      summary: result.generationResult.summary,
      unassigned: result.generationResult.unassigned,
    };
  } catch (error: unknown) {
    logger.error('GENERATE', 'Error al generar horario:', error);
    return { message: error instanceof Error ? error.message : 'Error al generar horario.' };
  }
}
