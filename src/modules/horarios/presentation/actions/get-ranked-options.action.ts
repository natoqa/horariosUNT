'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { calculateDocenteScore, DocenteScoreInput } from '../../domain/entities/scoring.entity';
import { calcularAntiguedad } from '@/modules/docentes';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { CategoriaDocente, CondicionDocente } from '@/shared/constants/categories';

export interface RankedDocente {
  id: string;
  nombre: string;
  categoria: string;
  condicion: string;
  antiguedad: number;
  score: number;
  isPreAssigned: boolean;
  bloques: {
    dia: DiaSemana;
    bloque: BloqueHorario;
    estado: 'preferido' | 'disponible';
  }[];
}

export interface CompatibleAula {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  capacidad: number;
  pabellon: string | null;
}

export interface RankedOptionsResult {
  docentes?: RankedDocente[];
  aulas?: CompatibleAula[];
  grupoInfo?: {
    cursoNombre: string;
    grupoNombre: string;
    ciclo: string;
    numEstudiantes: number;
    requiereLaboratorio: boolean;
    horasTeoricas: number;
    horasPracticas: number;
    docentePreAsignado: string | null;
  };
  message?: string;
}

export async function getRankedOptionsAction(
  periodoId: string,
  grupoId: string,
  horarioId: string,
): Promise<RankedOptionsResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No autorizado.' };
  }

  try {
    // Get grupo + curso info
    const { data: grupo } = await supabase
      .from('grupos')
      .select('id, curso_id, docente_id, nombre, num_estudiantes')
      .eq('id', grupoId)
      .single();

    if (!grupo) {
      return { message: 'Grupo no encontrado.' };
    }

    const { data: curso } = await supabase
      .from('cursos')
      .select('id, nombre, ciclo, horas_teoricas, horas_practicas, requiere_laboratorio')
      .eq('id', grupo.curso_id)
      .single();

    if (!curso) {
      return { message: 'Curso no encontrado.' };
    }

    // Get all data in parallel
    const [docentesRes, disponibilidadRes, aulasRes, restriccionesRes, asignacionesRes] =
      await Promise.all([
        supabase.from('docentes').select('*').eq('estado', 'Activo'),
        supabase.from('disponibilidad').select('*').eq('periodo_id', periodoId),
        supabase.from('aulas').select('*').eq('estado', 'Activa'),
        supabase.from('aula_restricciones').select('*'),
        supabase.from('asignaciones').select('*').eq('horario_id', horarioId),
      ]);

    // Build occupied slots from existing assignments
    const occupiedDocenteSlots = new Set<string>();
    const occupiedAulaSlots = new Set<string>();
    const occupiedCicloSlots = new Set<string>();
    for (const a of asignacionesRes.data ?? []) {
      if (a.dia === 'Pendiente' || a.bloque === 'Pendiente') continue;
      occupiedDocenteSlots.add(`${a.docente_id}||${a.dia}||${a.bloque}`);
      occupiedAulaSlots.add(`${a.aula_id}||${a.dia}||${a.bloque}`);
      // Get ciclo for this assignment's grupo
      const aGrupo = (await supabase.from('grupos').select('curso_id').eq('id', a.grupo_id).single()).data;
      if (aGrupo) {
        const aCurso = (await supabase.from('cursos').select('ciclo').eq('id', aGrupo.curso_id).single()).data;
        if (aCurso) {
          occupiedCicloSlots.add(`${aCurso.ciclo}||${a.dia}||${a.bloque}`);
        }
      }
    }

    // Build disponibilidad map
    const disponibilidadMap = new Map<string, string>();
    for (const d of disponibilidadRes.data ?? []) {
      const estadoMap: Record<string, string> = {
        'Disponible': 'disponible',
        'No disponible': 'no_disponible',
        'Preferido': 'preferido',
      };
      disponibilidadMap.set(
        `${d.docente_id}||${d.dia}||${d.bloque}`,
        estadoMap[d.estado] || d.estado,
      );
    }

    // Build aula restriction set
    const restriccionAulaSet = new Set<string>();
    for (const r of restriccionesRes.data ?? []) {
      restriccionAulaSet.add(`${r.aula_id}||${r.dia}||${r.bloque}`);
    }

    // Score and rank docentes
    const totalWeeklyBlocks = DIAS_SEMANA.length * BLOQUES_HORARIOS.length;
    const rankedDocentes: RankedDocente[] = [];

    for (const d of docentesRes.data ?? []) {
      // Build available slots for this docente (excluding occupied ones)
      const bloques: RankedDocente['bloques'] = [];
      let totalSlots = 0;
      let preferredSlots = 0;

      for (const dia of DIAS_SEMANA) {
        for (const bloque of BLOQUES_HORARIOS) {
          const estado = disponibilidadMap.get(`${d.id}||${dia}||${bloque}`);
          if (estado === 'disponible' || estado === 'preferido') {
            totalSlots++;
            if (estado === 'preferido') preferredSlots++;

            // Only include if not occupied
            if (!occupiedDocenteSlots.has(`${d.id}||${dia}||${bloque}`) &&
                !occupiedCicloSlots.has(`${curso.ciclo}||${dia}||${bloque}`)) {
              bloques.push({
                dia: dia as DiaSemana,
                bloque: bloque as BloqueHorario,
                estado: estado === 'preferido' ? 'preferido' : 'disponible',
              });
            }
          }
        }
      }

      // Skip docentes with no available slots
      if (bloques.length === 0) continue;

      const antiguedad = calcularAntiguedad(d.fecha_ingreso);
      const porcentajeDisponible = (totalSlots / totalWeeklyBlocks) * 100;
      const porcentajePreferido = totalSlots > 0 ? (preferredSlots / totalSlots) * 100 : 0;

      const scoreInput: DocenteScoreInput = {
        categoria: d.categoria as CategoriaDocente,
        condicion: d.condicion as CondicionDocente,
        aniosAntiguedad: antiguedad,
        porcentajeDisponible,
        porcentajePreferido,
        porcentajeCarga: 0,
      };

      // Sort bloques: preferidos first, then by day/time
      bloques.sort((a, b) => {
        if (a.estado === 'preferido' && b.estado !== 'preferido') return -1;
        if (a.estado !== 'preferido' && b.estado === 'preferido') return 1;
        const dayOrder = DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia);
        if (dayOrder !== 0) return dayOrder;
        return BLOQUES_HORARIOS.indexOf(a.bloque) - BLOQUES_HORARIOS.indexOf(b.bloque);
      });

      rankedDocentes.push({
        id: d.id,
        nombre: `${d.apellidos}, ${d.nombres}`,
        categoria: d.categoria,
        condicion: d.condicion,
        antiguedad,
        score: Math.round(calculateDocenteScore(scoreInput) * 10) / 10,
        isPreAssigned: grupo.docente_id === d.id,
        bloques,
      });
    }

    // Sort by score descending, pre-assigned first
    rankedDocentes.sort((a, b) => {
      if (a.isPreAssigned && !b.isPreAssigned) return -1;
      if (!a.isPreAssigned && b.isPreAssigned) return 1;
      return b.score - a.score;
    });

    // Filter compatible aulas
    const compatibleAulas: CompatibleAula[] = [];
    for (const a of aulasRes.data ?? []) {
      // Capacity check
      if (a.capacidad < grupo.num_estudiantes) continue;
      // Lab check
      if (curso.requiere_laboratorio && a.tipo === 'Aula Teórica') continue;
      if (!curso.requiere_laboratorio && a.tipo !== 'Aula Teórica' && a.tipo !== 'Auditorio') continue;

      compatibleAulas.push({
        id: a.id,
        nombre: a.nombre,
        codigo: a.codigo,
        tipo: a.tipo,
        capacidad: a.capacidad,
        pabellon: a.pabellon,
      });
    }

    // Sort aulas by capacity closest to needed
    compatibleAulas.sort((a, b) => {
      const diffA = a.capacidad - grupo.num_estudiantes;
      const diffB = b.capacidad - grupo.num_estudiantes;
      return diffA - diffB;
    });

    return {
      docentes: rankedDocentes,
      aulas: compatibleAulas,
      grupoInfo: {
        cursoNombre: curso.nombre,
        grupoNombre: grupo.nombre,
        ciclo: curso.ciclo,
        numEstudiantes: grupo.num_estudiantes,
        requiereLaboratorio: curso.requiere_laboratorio,
        horasTeoricas: curso.horas_teoricas,
        horasPracticas: curso.horas_practicas,
        docentePreAsignado: grupo.docente_id,
      },
    };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al obtener opciones.' };
  }
}
