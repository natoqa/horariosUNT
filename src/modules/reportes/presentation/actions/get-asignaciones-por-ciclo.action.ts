'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

export async function getAsignacionesPorCicloAction(ciclo: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo director o secretaria pueden ver esta vista.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const { data: asignaciones, error } = await supabase
    .from('asignaciones')
    .select(`
      id,
      dia,
      bloque,
      tipo,
      grupos!inner(
        nombre,
        cursos!inner(
          codigo,
          nombre,
          ciclo
        )
      ),
      docentes!inner(
        nombres,
        apellidos
      ),
      aulas!inner(
        nombre
      )
    `)
    .eq('periodo_id', periodoResult.data.id)
    .eq('grupos.cursos.ciclo', ciclo.toString());

  if (error) {
    return { message: error.message || 'Error al obtener las asignaciones.' };
  }

  const formattedAsignaciones = asignaciones?.map((a: any) => ({
    id: a.id,
    curso_codigo: a.grupos.cursos.codigo,
    curso_nombre: a.grupos.cursos.nombre,
    ciclo: parseInt(a.grupos.cursos.ciclo),
    grupo: a.grupos.nombre,
    docente_nombre: `${a.docentes.nombres} ${a.docentes.apellidos}`.trim(),
    aula_nombre: a.aulas.nombre,
    dia: a.dia,
    bloque: a.bloque,
    tipo: a.tipo,
  })) || [];

  return { data: formattedAsignaciones };
}
