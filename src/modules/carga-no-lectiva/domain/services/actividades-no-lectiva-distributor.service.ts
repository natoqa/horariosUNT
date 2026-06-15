import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Asignacion } from '@/modules/horarios/domain/entities/horario.entity';

export interface ActividadNoLectiva {
  id: string;
  tipo: string;
  horas: number;
  detalles: string;
  dia?: string;
  bloque?: string;
}

export interface ActividadNoLectivaInstance {
  tipo: string;
  horas: number;
  detalles: string;
  dia: string;
  bloque: string;
}

export interface DistribucionResult {
  success: boolean;
  message?: string;
  actividadesInstances?: ActividadNoLectivaInstance[];
}

/**
 * Distribuye aleatoriamente las actividades no lectivas en los horarios disponibles de cada docente
 * después de que se generen las asignaciones de cursos.
 * Si una actividad tiene N horas, crea N instancias distribuidas en bloques diferentes.
 */
export function distribuirActividadesNoLectivas(
  actividades: ActividadNoLectiva[],
  asignaciones: Asignacion[],
  docenteId: string,
): DistribucionResult {
  // Filtrar actividades que tienen horas > 0
  const actividadesConHoras = actividades.filter((a) => a.horas > 0);
  
  if (actividadesConHoras.length === 0) {
    return { success: true, message: 'No hay actividades no lectivas con horas para distribuir.' };
  }

  // Obtener los bloques ocupados por las asignaciones del docente
  const bloquesOcupados = new Set<string>();
  for (const a of asignaciones) {
    if (a.docenteId === docenteId && a.dia && a.bloque) {
      bloquesOcupados.add(`${a.dia}||${a.bloque}`);
    }
  }

  // Obtener todos los bloques disponibles
  const bloquesDisponibles: string[] = [];
  for (const dia of DIAS_SEMANA) {
    for (const bloque of BLOQUES_HORARIOS) {
      const key = `${dia}||${bloque}`;
      if (!bloquesOcupados.has(key)) {
        bloquesDisponibles.push(key);
      }
    }
  }

  if (bloquesDisponibles.length === 0) {
    return { success: false, message: 'No hay bloques disponibles para distribuir actividades no lectivas.' };
  }

  // Mezclar aleatoriamente los bloques disponibles
  const bloquesMezclados = [...bloquesDisponibles].sort(() => Math.random() - 0.5);

  // Crear instancias de actividades según sus horas
  const actividadesInstances: ActividadNoLectivaInstance[] = [];
  let bloqueIndex = 0;

  for (const actividad of actividadesConHoras) {
    const horasAsignar = Math.min(actividad.horas, bloquesMezclados.length - bloqueIndex);
    
    if (horasAsignar === 0) {
      console.warn(`No hay suficientes bloques disponibles para la actividad ${actividad.tipo}`);
      continue;
    }

    // Crear una instancia por cada hora
    for (let i = 0; i < horasAsignar; i++) {
      if (bloqueIndex >= bloquesMezclados.length) break;
      
      const [dia, bloque] = bloquesMezclados[bloqueIndex].split('||');
      actividadesInstances.push({
        tipo: actividad.tipo,
        horas: 1, // Cada instancia representa 1 hora
        detalles: actividad.detalles,
        dia,
        bloque,
      });
      bloqueIndex++;
    }
  }

  return {
    success: true,
    actividadesInstances,
    message: `Se crearon ${actividadesInstances.length} instancias de actividades no lectivas distribuidas en horarios disponibles.`,
  };
}
