import { DiaSemana, BloqueHorario, DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { Docente, calcularAntiguedad, getCargaMaximaDefault } from '@/modules/docentes';
import { Curso, Grupo } from '@/modules/cursos';
import { Aula, AulaRestriccion } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';
import { AsignacionTipo, GenerationSummary } from '../entities/horario.entity';
import { calculateDocenteScore, DocenteScoreInput } from '../entities/scoring.entity';
import {
  PartialAssignment,
  validateHardConstraints,
  validateMaxConsecutiveHours,
} from './constraint-validator.service';

export interface GenerationInput {
  docentes: Docente[];
  cursos: Curso[];
  grupos: Grupo[];
  aulas: Aula[];
  disponibilidades: Disponibilidad[];
  restriccionesAula: AulaRestriccion[];
}

export interface GeneratedAssignment {
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: AsignacionTipo;
}

export interface UnassignedUnit {
  grupoId: string;
  cursoNombre: string;
  tipo: AsignacionTipo;
  reason: string;
}

export interface GenerationResult {
  assignments: GeneratedAssignment[];
  unassigned: UnassignedUnit[];
  summary: GenerationSummary;
}

export type ProgressCallback = (phase: number, phaseName: string, progress: number) => void;

interface ScoredDocente {
  docente: Docente;
  score: number;
  availableSlots: { dia: DiaSemana; bloque: BloqueHorario; preferred: boolean }[];
  currentLoad: number;
}

interface AssignmentUnit {
  grupo: Grupo;
  curso: Curso;
  tipo: AsignacionTipo;
  horasNeeded: number;
}

const TOTAL_WEEKLY_BLOCKS = DIAS_SEMANA.length * BLOQUES_HORARIOS.length;

export function generateSchedule(
  input: GenerationInput,
  onProgress?: ProgressCallback,
): GenerationResult {
  const assignments: GeneratedAssignment[] = [];
  const partials: PartialAssignment[] = [];
  const unassigned: UnassignedUnit[] = [];

  const activeDocentes = input.docentes.filter((d) => d.estado === 'Activo');
  const activeAulas = input.aulas.filter((a) => a.estado === 'Activa');

  // Phase 2: Build availability matrix
  onProgress?.(2, 'Filtrando disponibilidad', 0);
  const disponibilidadMap = buildDisponibilidadMap(input.disponibilidades);
  const restriccionAulaSet = buildRestriccionAulaSet(input.restriccionesAula);

  // Phase 3: Classify constraints (implicit in validator)
  onProgress?.(3, 'Clasificando restricciones', 0);

  // Phase 4: Score and rank docentes
  onProgress?.(4, 'Priorizando docentes', 0);
  const scoredDocentes = scoreDocentes(activeDocentes, disponibilidadMap);

  // Phase 5: Build assignment units and assign docentes
  onProgress?.(5, 'Asignando cursos a docentes', 0);
  const units = buildAssignmentUnits(input.cursos, input.grupos);

  const docenteLoadMap = new Map<string, number>();
  activeDocentes.forEach((d) => docenteLoadMap.set(d.id, 0));

  const unitDocentes = assignDocentesToUnits(units, scoredDocentes, docenteLoadMap);

  // Phase 6: Assign blocks and rooms
  onProgress?.(6, 'Asignando bloques y aulas', 0);

  const cursoMap = new Map(input.cursos.map((c) => [c.id, c]));
  const grupoMap = new Map(input.grupos.map((g) => [g.id, g]));

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const docenteId = unitDocentes.get(unitKey(unit));

    if (!docenteId) {
      unassigned.push({
        grupoId: unit.grupo.id,
        cursoNombre: unit.curso.nombre,
        tipo: unit.tipo,
        reason: 'No se encontró docente disponible',
      });
      continue;
    }

    const docente = activeDocentes.find((d) => d.id === docenteId);
    if (!docente) continue;

    const slots = getDocenteAvailableSlots(docenteId, disponibilidadMap);
    const curso = cursoMap.get(unit.grupo.cursoId);
    if (!curso) continue;

    let assigned = false;

    for (let h = 0; h < unit.horasNeeded && !assigned; h++) {
      let blockAssigned = false;

      // Sort slots: preferred first
      const sortedSlots = [...slots].sort((a, b) => {
        if (a.preferred && !b.preferred) return -1;
        if (!a.preferred && b.preferred) return 1;
        return 0;
      });

      for (const slot of sortedSlots) {
        const compatibleAulas = activeAulas.filter((aula) => {
          if (restriccionAulaSet.has(`${aula.id}||${slot.dia}||${slot.bloque}`)) return false;
          if (aula.capacidad < unit.grupo.numEstudiantes) return false;
          if (curso.requiereLaboratorio && aula.tipo === 'Aula Teórica') return false;
          if (!curso.requiereLaboratorio && aula.tipo !== 'Aula Teórica' && aula.tipo !== 'Auditorio') return false;
          return true;
        });

        for (const aula of compatibleAulas) {
          const candidate: PartialAssignment = {
            grupoId: unit.grupo.id,
            docenteId,
            aulaId: aula.id,
            dia: slot.dia,
            bloque: slot.bloque,
            tipo: unit.tipo,
            ciclo: curso.ciclo,
            aulaCapacidad: aula.capacidad,
            numEstudiantes: unit.grupo.numEstudiantes,
            aulaType: aula.tipo,
            requiereLaboratorio: curso.requiereLaboratorio,
          };

          const hardViolations = validateHardConstraints(partials, candidate);
          const consecutiveViolations = validateMaxConsecutiveHours(partials, candidate);

          if (hardViolations.length === 0 && consecutiveViolations.length === 0) {
            assignments.push({
              grupoId: unit.grupo.id,
              docenteId,
              aulaId: aula.id,
              dia: slot.dia,
              bloque: slot.bloque,
              tipo: unit.tipo,
            });
            partials.push(candidate);
            slots.splice(slots.indexOf(slot), 1);
            docenteLoadMap.set(docenteId, (docenteLoadMap.get(docenteId) ?? 0) + 1);
            blockAssigned = true;
            break;
          }
        }

        if (blockAssigned) break;
      }

      if (!blockAssigned) {
        if (h === 0) {
          unassigned.push({
            grupoId: unit.grupo.id,
            cursoNombre: unit.curso.nombre,
            tipo: unit.tipo,
            reason: 'No se encontró bloque/aula compatible sin conflictos',
          });
        }
        assigned = true;
      }
    }

    onProgress?.(6, 'Asignando bloques y aulas', Math.round(((i + 1) / units.length) * 100));
  }

  // Phase 7: Validate all
  onProgress?.(7, 'Validando conflictos', 0);

  // Phase 8: Optimization (local swaps for preferences)
  onProgress?.(8, 'Optimizando', 0);
  optimizePreferences(assignments, partials, disponibilidadMap);

  // Phase 9: Build summary
  onProgress?.(9, 'Generando resumen', 0);

  const totalUnits = units.length;
  const assignedUnits = totalUnits - unassigned.length;

  const preferredCount = assignments.filter((a) => {
    const key = `${a.docenteId}||${a.dia}||${a.bloque}`;
    return disponibilidadMap.get(key) === 'preferido';
  }).length;

  const loads = Array.from(docenteLoadMap.values()).filter((l) => l > 0);

  const summary: GenerationSummary = {
    totalCursos: totalUnits,
    cursosAsignados: assignedUnits,
    cursosNoAsignados: unassigned.length,
    porcentajePreferencias: assignments.length > 0 ? Math.round((preferredCount / assignments.length) * 100) : 0,
    cargaPromedio: loads.length > 0 ? Math.round((loads.reduce((s, l) => s + l, 0) / loads.length) * 10) / 10 : 0,
    cargaMaxima: loads.length > 0 ? Math.max(...loads) : 0,
    cargaMinima: loads.length > 0 ? Math.min(...loads) : 0,
  };

  onProgress?.(9, 'Completado', 100);

  return { assignments, unassigned, summary };
}

function buildDisponibilidadMap(disponibilidades: Disponibilidad[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const d of disponibilidades) {
    map.set(`${d.docenteId}||${d.dia}||${d.bloque}`, d.estado);
  }
  return map;
}

function buildRestriccionAulaSet(restricciones: AulaRestriccion[]): Set<string> {
  const set = new Set<string>();
  for (const r of restricciones) {
    set.add(`${r.aulaId}||${r.dia}||${r.bloque}`);
  }
  return set;
}

function scoreDocentes(
  docentes: Docente[],
  disponibilidadMap: Map<string, string>,
): ScoredDocente[] {
  return docentes
    .map((docente) => {
      const slots = getDocenteAvailableSlots(docente.id, disponibilidadMap);
      const totalSlots = slots.length;
      const preferredSlots = slots.filter((s) => s.preferred).length;
      const porcentajeDisponible = (totalSlots / TOTAL_WEEKLY_BLOCKS) * 100;
      const porcentajePreferido = totalSlots > 0 ? (preferredSlots / totalSlots) * 100 : 0;

      const input: DocenteScoreInput = {
        categoria: docente.categoria,
        condicion: docente.condicion,
        aniosAntiguedad: calcularAntiguedad(docente.fechaIngreso),
        porcentajeDisponible,
        porcentajePreferido,
        porcentajeCarga: 0,
      };

      return {
        docente,
        score: calculateDocenteScore(input),
        availableSlots: slots,
        currentLoad: 0,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function getDocenteAvailableSlots(
  docenteId: string,
  disponibilidadMap: Map<string, string>,
): { dia: DiaSemana; bloque: BloqueHorario; preferred: boolean }[] {
  const slots: { dia: DiaSemana; bloque: BloqueHorario; preferred: boolean }[] = [];
  for (const dia of DIAS_SEMANA) {
    for (const bloque of BLOQUES_HORARIOS) {
      const estado = disponibilidadMap.get(`${docenteId}||${dia}||${bloque}`);
      if (estado === 'disponible' || estado === 'preferido') {
        slots.push({ dia, bloque, preferred: estado === 'preferido' });
      }
    }
  }
  return slots;
}

function buildAssignmentUnits(cursos: Curso[], grupos: Grupo[]): AssignmentUnit[] {
  const units: AssignmentUnit[] = [];

  for (const grupo of grupos) {
    const curso = cursos.find((c) => c.id === grupo.cursoId);
    if (!curso || curso.estado !== 'Activo') continue;

    if (curso.horasTeoricas > 0) {
      units.push({ grupo, curso, tipo: 'teorico', horasNeeded: curso.horasTeoricas });
    }
    if (curso.horasPracticas > 0) {
      units.push({ grupo, curso, tipo: 'practico', horasNeeded: curso.horasPracticas });
    }
  }

  // Most constrained first (fewer eligible slots = higher priority)
  return units.sort((a, b) => a.horasNeeded - b.horasNeeded);
}

function unitKey(unit: AssignmentUnit): string {
  return `${unit.grupo.id}||${unit.tipo}`;
}

function assignDocentesToUnits(
  units: AssignmentUnit[],
  scoredDocentes: ScoredDocente[],
  docenteLoadMap: Map<string, number>,
): Map<string, string> {
  const result = new Map<string, string>();
  const cursoDocenteMap = new Map<string, string>();

  for (const unit of units) {
    const key = unitKey(unit);

    // RN-030: Prefer same docente for theory+practice of same curso
    const existingDocente = cursoDocenteMap.get(unit.grupo.cursoId);
    if (existingDocente) {
      const docente = scoredDocentes.find((sd) => sd.docente.id === existingDocente);
      if (docente) {
        const currentLoad = docenteLoadMap.get(existingDocente) ?? 0;
        const maxLoad = getCargaMaximaDefault(docente.docente.regimen);
        if (currentLoad + unit.horasNeeded <= maxLoad) {
          result.set(key, existingDocente);
          continue;
        }
      }
    }

    // Find best available docente by score
    for (const sd of scoredDocentes) {
      const currentLoad = docenteLoadMap.get(sd.docente.id) ?? 0;
      const maxLoad = getCargaMaximaDefault(sd.docente.regimen);

      if (currentLoad + unit.horasNeeded > maxLoad) continue;
      if (sd.availableSlots.length < unit.horasNeeded) continue;

      result.set(key, sd.docente.id);
      cursoDocenteMap.set(unit.grupo.cursoId, sd.docente.id);
      break;
    }
  }

  return result;
}

function optimizePreferences(
  assignments: GeneratedAssignment[],
  partials: PartialAssignment[],
  disponibilidadMap: Map<string, string>,
): void {
  const MAX_ITERATIONS = 100;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let improved = false;

    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      const aKey = `${a.docenteId}||${a.dia}||${a.bloque}`;
      const aIsPreferred = disponibilidadMap.get(aKey) === 'preferido';
      if (aIsPreferred) continue;

      for (let j = i + 1; j < assignments.length; j++) {
        const b = assignments[j];
        if (a.docenteId !== b.docenteId) continue;

        const bKey = `${b.docenteId}||${b.dia}||${b.bloque}`;
        const bIsPreferred = disponibilidadMap.get(bKey) === 'preferido';

        const aInBSlot = disponibilidadMap.get(`${a.docenteId}||${b.dia}||${b.bloque}`);
        const bInASlot = disponibilidadMap.get(`${b.docenteId}||${a.dia}||${a.bloque}`);

        if (!aInBSlot || aInBSlot === 'no_disponible') continue;
        if (!bInASlot || bInASlot === 'no_disponible') continue;

        const currentPreferred = (aIsPreferred ? 1 : 0) + (bIsPreferred ? 1 : 0);
        const swappedPreferred =
          (aInBSlot === 'preferido' ? 1 : 0) + (bInASlot === 'preferido' ? 1 : 0);

        if (swappedPreferred > currentPreferred) {
          const tempDia = a.dia;
          const tempBloque = a.bloque;
          const tempAulaId = a.aulaId;
          a.dia = b.dia;
          a.bloque = b.bloque;
          a.aulaId = b.aulaId;
          b.dia = tempDia;
          b.bloque = tempBloque;
          b.aulaId = tempAulaId;

          partials[i].dia = a.dia;
          partials[i].bloque = a.bloque;
          partials[i].aulaId = a.aulaId;
          partials[j].dia = b.dia;
          partials[j].bloque = b.bloque;
          partials[j].aulaId = b.aulaId;

          improved = true;
        }
      }
    }

    if (!improved) break;
  }
}
