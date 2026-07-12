'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

export async function getCargaNoLectivaAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id, carga_maxima')
    .eq('correo', user.email)
    .maybeSingle();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un docente asociado a este usuario.' };
  }

  const repo = new SupabaseCargaNoLectivaRepository();
  const actividades = await repo.findActividadesByDocentePeriodo(docenteData.id, periodoResult.data.id);
  const carga = await repo.findCargaTotalByDocentePeriodo(docenteData.id, periodoResult.data.id);

  const { data: grupos } = await supabase
    .from('grupos')
    .select('docente_id, cursos!inner(codigo, nombre, horas_teoricas, horas_practicas, ciclo, tipo)')
    .eq('periodo_id', periodoResult.data.id)
    .eq('docente_id', docenteData.id);

  let cargaElectivaCalculada = 0;
  const cursos: Array<{ codigo: string; nombre: string; horas: number; ciclo: string; tipo: string }> = [];
  if (grupos) {
    grupos.forEach((grupo: any) => {
      const curso = grupo.cursos;
      const horasTotales = (curso.horas_teoricas || 0) + (curso.horas_practicas || 0);
      cargaElectivaCalculada += horasTotales;
      cursos.push({
        codigo: curso.codigo,
        nombre: curso.nombre,
        horas: horasTotales,
        ciclo: curso.ciclo,
        tipo: curso.tipo,
      });
    });
  }

  return {
    data: {
      periodoId: periodoResult.data.id,
      periodoName: periodoResult.data.name,
      actividades,
      carga,
      docente: {
        cargaMaxima: docenteData.carga_maxima,
        cargaElectiva: cargaElectivaCalculada,
        cursos,
      },
    },
  };
}
