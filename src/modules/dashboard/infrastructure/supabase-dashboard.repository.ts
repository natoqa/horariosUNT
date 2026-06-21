import { createClient } from '@/shared/lib/supabase/server';
import { IDashboardRepository } from '../domain/repositories/dashboard.repository';
import { DashboardDirectorDTO, DashboardSecretariaDTO, DashboardDocenteDTO, Alerta } from '../application/dtos/dashboard.dto';

export class SupabaseDashboardRepository implements IDashboardRepository {
  async getDirectorDashboard(): Promise<DashboardDirectorDTO> {
    const supabase = await createClient();

    // Obtener período activo
    const { data: periodo } = await supabase
      .from('periodos')
      .select('id, estado')
      .in('estado', ['recopilacion', 'generacion', 'aprobado', 'publicado'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const estadoPeriodo = periodo?.estado || 'sin_periodo';

    // Obtener estadísticas de disponibilidad
    const { data: docentes } = await supabase
      .from('docentes')
      .select('id, estado')
      .eq('estado', 'Activo');

    const totalDocentes = docentes?.length || 0;

    const { data: disponibilidades } = await supabase
      .from('disponibilidad')
      .select('docente_id')
      .eq('periodo_id', periodo?.id || '');

    const docentesConDisponibilidad = new Set(disponibilidades?.map((d) => d.docente_id)).size;
    const porcentajeDisponibilidad = totalDocentes > 0
      ? (docentesConDisponibilidad / totalDocentes) * 100
      : 0;

    // Obtener estadísticas de carga
    const { data: asignaciones } = await supabase
      .from('asignaciones')
      .select('docentes!inner(carga_maxima)')
      .eq('periodo_id', periodo?.id || '');

    const cargaPorDocente: Record<string, number> = {};
    asignaciones?.forEach((a: any) => {
      const docenteId = a.docentes.id;
      cargaPorDocente[docenteId] = (cargaPorDocente[docenteId] || 0) + 1;
    });

    const cargas = Object.values(cargaPorDocente);
    const cargaPromedio = cargas.length > 0
      ? cargas.reduce((a, b) => a + b, 0) / cargas.length
      : 0;
    const cargaMaxima = cargas.length > 0 ? Math.max(...cargas) : 0;
    const cargaMinima = cargas.length > 0 ? Math.min(...cargas) : 0;

    // Obtener ocupación de aulas
    const { data: aulas } = await supabase
      .from('aulas')
      .select('id')
      .eq('estado', 'Activa');

    const totalAulas = aulas?.length || 0;

    const { data: asignacionesAulas } = await supabase
      .from('asignaciones')
      .select('aula_id')
      .eq('periodo_id', periodo?.id || '');

    const aulasUsadas = new Set(asignacionesAulas?.map((a) => a.aula_id)).size;
    const ocupacionAulas = totalAulas > 0 ? (aulasUsadas / totalAulas) * 100 : 0;

    // Obtener estadísticas de cursos
    const { data: cursos } = await supabase
      .from('cursos')
      .select('id')
      .eq('periodo_id', periodo?.id || '');

    const totalCursos = cursos?.length || 0;

    const { data: asignacionesData } = await supabase
      .from('asignaciones')
      .select('grupo_id')
      .eq('periodo_id', periodo?.id || '');

    const cursosAsignados = new Set(asignacionesData?.map((a) => a.grupo_id)).size;

    // Generar alertas
    const alertas: Alerta[] = [];
    if (porcentajeDisponibilidad < 50) {
      alertas.push({
        id: '1',
        tipo: 'pendiente',
        mensaje: `Solo el ${porcentajeDisponibilidad.toFixed(0)}% de docentes han registrado disponibilidad`,
        severidad: 'alta',
      });
    }
    if (cargaMaxima > 20) {
      alertas.push({
        id: '2',
        tipo: 'advertencia',
        mensaje: `Algunos docentes tienen carga excesiva (${cargaMaxima} horas)`,
        severidad: 'media',
      });
    }
    if (estadoPeriodo === 'recopilacion') {
      alertas.push({
        id: '3',
        tipo: 'pendiente',
        mensaje: 'Período de recopilación de disponibilidad en curso',
        severidad: 'media',
      });
    }

    // Obtener estadísticas de carga horaria
    const { data: cargasNoLectivas } = await supabase
      .from('cargas_no_lectivas')
      .select('docente_id, total_horas, estado, director_aprobado, secretaria_aprobado')
      .eq('periodo_id', periodo?.id || '');

    const docentesConCargaRegistrada = new Set(cargasNoLectivas?.map((c) => c.docente_id)).size;
    const docentesConCargaAprobada = cargasNoLectivas?.filter((c) => c.director_aprobado && c.secretaria_aprobado).length || 0;
    const cargaTotalNoLectiva = cargasNoLectivas?.reduce((sum, c) => sum + (c.total_horas || 0), 0) || 0;

    // Calcular carga lectiva desde grupos
    const { data: grupos } = await supabase
      .from('grupos')
      .select('docente_id, cursos!inner(horas_teoricas, horas_practicas)')
      .eq('periodo_id', periodo?.id || '');

    const cargaTotalLectiva = grupos?.reduce((sum, g: any) => {
      return sum + (g.cursos.horas_teoricas || 0) + (g.cursos.horas_practicas || 0);
    }, 0) || 0;

    // Obtener notificaciones pendientes
    const { data: notificaciones } = await supabase
      .from('notificaciones')
      .select('id')
      .eq('leida', false);

    const notificacionesPendientes = notificaciones?.length || 0;

    // Validación para generación de horarios
    const { data: gruposAsignados } = await supabase
      .from('grupos')
      .select('docente_id')
      .eq('periodo_id', periodo?.id || '')
      .not('docente_id', 'is', null);

    const docentesAsignados = new Set(gruposAsignados?.map((g) => g.docente_id) || []);
    const docentesConCargaAprobadaIds = cargasNoLectivas?.filter(
      (c) => c.director_aprobado && c.secretaria_aprobado
    ).map((c) => c.docente_id) || [];

    const docentesPendientesGeneracion = [...docentesAsignados].filter(
      (id) => !docentesConCargaAprobadaIds.includes(id)
    ).length;

    const generacionHabilitada = docentesPendientesGeneracion === 0;

    if (!generacionHabilitada) {
      alertas.push({
        id: '4',
        tipo: 'pendiente',
        mensaje: `Faltan ${docentesPendientesGeneracion} docente(s) con carga no lectiva aprobada para habilitar la generación de horarios`,
        severidad: 'alta',
      });
    }

    return {
      estadoPeriodo,
      porcentajeDisponibilidad,
      totalDocentes,
      docentesConDisponibilidad,
      cargaPromedio,
      cargaMaxima,
      cargaMinima,
      ocupacionAulas,
      totalCursos,
      cursosAsignados,
      alertas,
      cargaHoraria: {
        totalDocentes,
        docentesConCargaRegistrada,
        docentesConCargaAprobada,
        cargaTotalLectiva,
        cargaTotalNoLectiva,
        cargaTotal: cargaTotalLectiva + cargaTotalNoLectiva,
      },
      notificacionesPendientes,
      generacionHabilitada,
      docentesPendientesGeneracion,
    };
  }

  async getSecretariaDashboard(): Promise<DashboardSecretariaDTO> {
    const supabase = await createClient();

    // Obtener período activo
    const { data: periodo } = await supabase
      .from('periodos')
      .select('id')
      .in('estado', ['recopilacion', 'generacion', 'aprobado', 'publicado'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: docentes } = await supabase
      .from('docentes')
      .select('id, estado');

    const { data: cursos } = await supabase
      .from('cursos')
      .select('id');

    const { data: aulas } = await supabase
      .from('aulas')
      .select('id, estado');

    const { data: grupos } = await supabase
      .from('grupos')
      .select('id, docente_id');

    const gruposSinDocente = grupos?.filter((g) => !g.docente_id).length || 0;

    // Obtener estadísticas de carga horaria
    const { data: cargasNoLectivas } = await supabase
      .from('cargas_no_lectivas')
      .select('docente_id, total_horas, estado, director_aprobado, secretaria_aprobado')
      .eq('periodo_id', periodo?.id || '');

    const docentesConCargaRegistrada = new Set(cargasNoLectivas?.map((c) => c.docente_id)).size;
    const docentesConCargaAprobada = cargasNoLectivas?.filter((c) => c.director_aprobado && c.secretaria_aprobado).length || 0;
    const cargaTotalNoLectiva = cargasNoLectivas?.reduce((sum, c) => sum + (c.total_horas || 0), 0) || 0;

    // Calcular carga lectiva desde grupos
    const { data: gruposCarga } = await supabase
      .from('grupos')
      .select('docente_id, cursos!inner(horas_teoricas, horas_practicas)')
      .eq('periodo_id', periodo?.id || '');

    const cargaTotalLectiva = gruposCarga?.reduce((sum, g: any) => {
      return sum + (g.cursos.horas_teoricas || 0) + (g.cursos.horas_practicas || 0);
    }, 0) || 0;

    const docentesPendientesCarga = (docentes?.length || 0) - docentesConCargaRegistrada;

    return {
      totalDocentes: docentes?.length || 0,
      totalCursos: cursos?.length || 0,
      totalAulas: aulas?.length || 0,
      totalGrupos: grupos?.length || 0,
      docentesActivos: docentes?.filter((d) => d.estado === 'Activo').length || 0,
      cursosActivos: cursos?.length || 0,
      aulasActivas: aulas?.filter((a) => a.estado === 'Activa').length || 0,
      cargaHoraria: {
        totalDocentes: docentes?.length || 0,
        docentesConCargaRegistrada,
        docentesConCargaAprobada,
        cargaTotalLectiva,
        cargaTotalNoLectiva,
        cargaTotal: cargaTotalLectiva + cargaTotalNoLectiva,
      },
      docentesPendientesCarga,
      gruposSinDocente,
    };
  }

  async getDocenteDashboard(docenteId: string): Promise<DashboardDocenteDTO> {
    const supabase = await createClient();

    // Obtener período activo
    const { data: periodo } = await supabase
      .from('periodos')
      .select('id, estado')
      .in('estado', ['recopilacion', 'generacion', 'aprobado', 'publicado'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Verificar disponibilidad
    const { data: disponibilidad } = await supabase
      .from('disponibilidad')
      .select('id')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodo?.id || '')
      .single();

    const estadoDisponibilidad = disponibilidad ? 'registrada' : 'pendiente';

    // Obtener carga asignada
    const { data: asignaciones } = await supabase
      .from('asignaciones')
      .select(`
        dia,
        bloque,
        grupos!inner(
          cursos!inner(
            codigo,
            nombre
          )
        ),
        aulas!inner(
          nombre
        )
      `)
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodo?.id || '');

    const cargaAsignada = asignaciones?.length || 0;

    // Obtener carga máxima del docente
    const { data: docente } = await supabase
      .from('docentes')
      .select('carga_maxima')
      .eq('id', docenteId)
      .single();

    const cargaMaxima = docente?.carga_maxima || 20;

    // Formatear horario semanal
    const horarioSemanal = asignaciones?.map((a: any) => ({
      dia: a.dia,
      bloque: a.bloque,
      curso: `${a.grupos.cursos.codigo} - ${a.grupos.cursos.nombre}`,
      aula: a.aulas.nombre,
    })) || [];

    // Obtener carga horaria del docente
    const { data: gruposDocente } = await supabase
      .from('grupos')
      .select('docente_id, cursos!inner(codigo, nombre, horas_teoricas, horas_practicas, ciclo)')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodo?.id || '');

    const cargaElectiva = gruposDocente?.reduce((sum, g: any) => {
      return sum + (g.cursos.horas_teoricas || 0) + (g.cursos.horas_practicas || 0);
    }, 0) || 0;

    const cursosAsignados = gruposDocente?.map((g: any) => ({
      codigo: g.cursos.codigo,
      nombre: g.cursos.nombre,
      ciclo: g.cursos.ciclo,
      horas: (g.cursos.horas_teoricas || 0) + (g.cursos.horas_practicas || 0),
      grupo: g.nombre || '',
    })) || [];

    // Obtener carga no lectiva
    const { data: cargaNoLectivaData } = await supabase
      .from('cargas_no_lectivas')
      .select('total_horas, estado, director_aprobado, secretaria_aprobado')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodo?.id || '')
      .single();

    const cargaNoLectiva = cargaNoLectivaData?.total_horas || 0;
    const estadoCargaNoLectiva = cargaNoLectivaData?.estado || 'Sin registrar';
    const horasDisponiblesNoLectivas = Math.max(0, cargaMaxima - cargaElectiva);

    // Obtener notificaciones
    const { data: notificaciones } = await supabase
      .from('notificaciones')
      .select('id')
      .eq('docente_id', docenteId)
      .eq('leida', false);

    const notificacionesCount = notificaciones?.length || 0;

    return {
      estadoDisponibilidad,
      cargaAsignada,
      cargaMaxima,
      horarioSemanal,
      cargaHoraria: {
        cargaElectiva,
        cargaNoLectiva,
        cargaTotal: cargaElectiva + cargaNoLectiva,
        horasDisponiblesNoLectivas,
        estadoAprobacion: cargaNoLectiva?.estado || 'Sin registrar',
        directorAprobado: cargaNoLectiva?.director_aprobado || false,
        secretariaAprobado: cargaNoLectiva?.secretaria_aprobado || false,
      },
      cursosAsignados,
      estadoCargaNoLectiva,
      notificaciones: notificacionesCount,
    };
  }
}
