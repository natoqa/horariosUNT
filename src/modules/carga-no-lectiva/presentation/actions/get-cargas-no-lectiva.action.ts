'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

async function calcularCargaElectivaPorDocente(periodoId: string): Promise<Map<string, { totalHoras: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }>> {
  const supabase = await createClient();
  
  const { data: grupos, error: gruposError } = await supabase
    .from('grupos')
    .select('docente_id, cursos!inner(codigo, nombre, horas_teoricas, horas_practicas)')
    .eq('periodo_id', periodoId)
    .not('docente_id', 'is', null);

  if (gruposError || !grupos) {
    return new Map();
  }

  const cargaElectivaMap = new Map<string, { totalHoras: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }>();

  grupos.forEach((grupo: any) => {
    const docenteId = grupo.docente_id;
    const curso = grupo.cursos;
    const horasTotales = (curso.horas_teoricas || 0) + (curso.horas_practicas || 0);
    
    const current = cargaElectivaMap.get(docenteId) || { totalHoras: 0, cursos: [] };
    current.totalHoras += horasTotales;
    current.cursos.push({
      codigo: curso.codigo,
      nombre: curso.nombre,
      horas: horasTotales,
    });
    cargaElectivaMap.set(docenteId, current);
  });

  return cargaElectivaMap;
}

export async function getCargasNoLectivaAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo director o secretaria pueden ver este módulo.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const repo = new SupabaseCargaNoLectivaRepository();
  const cargas = await repo.listCargasByPeriodo(periodoResult.data.id);

  const cargaElectivaMap = await calcularCargaElectivaPorDocente(periodoResult.data.id);

  const response: {
    periodoId: string;
    periodoName: string;
    cargas: any;
    docentes?: Array<{ id: string; nombres: string; apellidos: string; correo: string; cargaMaxima: number; cargaElectiva: number; cursos: Array<{ codigo: string; nombre: string; horas: number }> }>;
  } = {
    periodoId: periodoResult.data.id,
    periodoName: periodoResult.data.name,
    cargas,
  };

  if (role === 'secretaria') {
    const { data: docentesData, error: docentesError } = await supabase
      .from('docentes')
      .select('id, nombres, apellidos, correo, carga_maxima');

    if (!docentesError && docentesData) {
      response.docentes = docentesData.map((d: any) => {
        const cargaInfo = cargaElectivaMap.get(d.id) || { totalHoras: 0, cursos: [] };
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
    }
  } else if (role === 'director') {
    const docenteIds = cargas.map((c: any) => c.docenteId);
    const { data: docentesData } = await supabase
      .from('docentes')
      .select('id, carga_maxima')
      .in('id', docenteIds);

    const docentesMap = new Map();
    if (docentesData) {
      docentesData.forEach((d: any) => {
        docentesMap.set(d.id, {
          cargaMaxima: d.carga_maxima,
        });
      });
    }

    response.cargas = cargas.map((c: any) => {
      const docenteInfo = docentesMap.get(c.docenteId);
      const cargaInfo = cargaElectivaMap.get(c.docenteId) || { totalHoras: 0, cursos: [] };
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
