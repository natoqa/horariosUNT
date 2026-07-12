'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

async function calcularCargaElectivaPorDocente(periodoId: string): Promise<Record<string, { totalHoras: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }>> {
  const supabase = await createClient();
  
  const { data: grupos, error: gruposError } = await supabase
    .from('grupos')
    .select('docente_id, cursos!inner(codigo, nombre, horas_teoricas, horas_practicas)')
    .eq('periodo_id', periodoId)
    .not('docente_id', 'is', null);

  if (gruposError || !grupos) {
    return {};
  }

  const cargaElectivaMap: Record<string, { totalHoras: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }> = {};

  grupos.forEach((grupo: any) => {
    const docenteId = grupo.docente_id;
    const curso = grupo.cursos;
    const horasTotales = (curso.horas_teoricas || 0) + (curso.horas_practicas || 0);
    
    const current = cargaElectivaMap[docenteId] || { totalHoras: 0, cursos: [] };
    current.totalHoras += horasTotales;
    current.cursos.push({
      codigo: curso.codigo,
      nombre: curso.nombre,
      horas: horasTotales,
    });
    cargaElectivaMap[docenteId] = current;
  });

  return cargaElectivaMap;
}

export async function getCargasNoLectivaAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log('getCargasNoLectivaAction - user:', user);

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  console.log('getCargasNoLectivaAction - role:', role);

  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo director o secretaria pueden ver este módulo.' };
  }

  const periodoResult = await getActivePeriodoAction();
  console.log('getCargasNoLectivaAction - periodoResult:', periodoResult);

  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const repo = new SupabaseCargaNoLectivaRepository();
  const cargas = await repo.listCargasByPeriodo(periodoResult.data.id);
  console.log('getCargasNoLectivaAction - cargas:', cargas);

  const cargaElectivaMap = await calcularCargaElectivaPorDocente(periodoResult.data.id);
  console.log('getCargasNoLectivaAction - cargaElectivaMap:', cargaElectivaMap);

  // Obtener actividades no lectivas de todos los docentes
  const { data: actividadesData, error: actividadesError } = await supabase
    .from('actividades_no_lectivas')
    .select('docente_id, tipo, horas, detalles')
    .eq('periodo_id', periodoResult.data.id);

  console.log('getCargasNoLectivaAction - actividadesData:', actividadesData);
  console.log('getCargasNoLectivaAction - actividadesError:', actividadesError);

  // Agrupar actividades por docente
  const actividadesPorDocente: Record<string, Array<{ tipo: string; horas: number; detalles: string }>> = {};
  if (actividadesData && !actividadesError) {
    actividadesData.forEach((actividad: any) => {
      if (!actividadesPorDocente[actividad.docente_id]) {
        actividadesPorDocente[actividad.docente_id] = [];
      }
      actividadesPorDocente[actividad.docente_id].push({
        tipo: actividad.tipo,
        horas: actividad.horas,
        detalles: actividad.detalles,
      });
    });
  }

  const response: {
    periodoId: string;
    periodoName: string;
    cargas: any;
    docentes?: Array<{ id: string; nombres: string; apellidos: string; correo: string; cargaMaxima: number; cargaElectiva: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }>;
    actividades?: Record<string, Array<{ tipo: string; horas: number; detalles: string }>>;
  } = {
    periodoId: periodoResult.data.id,
    periodoName: periodoResult.data.name,
    cargas,
    actividades: actividadesPorDocente,
  };

  if (role === 'secretaria') {
    const { data: docentesData, error: docentesError } = await supabase
      .from('docentes')
      .select('id, nombres, apellidos, correo, carga_maxima');

    console.log('getCargasNoLectivaAction - docentesData:', docentesData);
    console.log('getCargasNoLectivaAction - docentesError:', docentesError);

    if (!docentesError && docentesData) {
      // Filtrar solo docentes que tienen grupos asignados
      response.docentes = docentesData
        .filter((d: any) => cargaElectivaMap[d.id]) // Solo docentes con cargaElectiva > 0
        .map((d: any) => {
          const cargaInfo = cargaElectivaMap[d.id] || { totalHoras: 0, cursos: [] };
          return {
            id: d.id,
            nombres: d.nombres,
            apellidos: d.apellidos,
            correo: d.correo,
            cargaMaxima: d.carga_maxima,
            cargaElectiva: cargaInfo.totalHoras,
            cursos: cargaInfo.cursos,
          };
        });
    } else {
      console.log('getCargasNoLectivaAction - Error loading docentes for secretaria');
    }
  } else if (role === 'director') {
    const docenteIds = cargas.map((c: any) => c.docenteId);
    const { data: docentesData } = await supabase
      .from('docentes')
      .select('id, carga_maxima')
      .in('id', docenteIds);

    const docentesMap: Record<string, { cargaMaxima: number }> = {};
    if (docentesData) {
      docentesData.forEach((d: any) => {
        docentesMap[d.id] = {
          cargaMaxima: d.carga_maxima,
        };
      });
    }

    // Filtrar solo cargas de docentes que tienen grupos asignados
    response.cargas = cargas
      .filter((c: any) => cargaElectivaMap[c.docenteId])
      .map((c: any) => {
        const docenteInfo = docentesMap[c.docenteId];
        const cargaInfo = cargaElectivaMap[c.docenteId] || { totalHoras: 0, cursos: [] };
        return {
          ...c,
          id: c.id,
          cargaId: c.id,
          cargaMaxima: docenteInfo?.cargaMaxima ?? 0,
          cargaElectiva: cargaInfo.totalHoras,
          cursos: cargaInfo.cursos,
          horasDisponiblesNoLectivas: Math.max(0, (docenteInfo?.cargaMaxima ?? 0) - cargaInfo.totalHoras),
        };
      });
  }

  return { data: response };
}
