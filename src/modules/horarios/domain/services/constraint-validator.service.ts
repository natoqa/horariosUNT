import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { AsignacionTipo } from '../entities/horario.entity';

export interface PartialAssignment {
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: AsignacionTipo;
  ciclo: string;
  aulaCapacidad: number;
  numEstudiantes: number;
  aulaType: string;
  requiereLaboratorio: boolean;
  pabellon?: string | null;
}

export interface Violation {
  rule: string;
  message: string;
}

export function validateHardConstraints(
  existing: PartialAssignment[],
  candidate: PartialAssignment,
): Violation[] {
  const violations: Violation[] = [];

  const sameSlot = existing.filter(
    (a) => a.dia === candidate.dia && a.bloque === candidate.bloque,
  );

  // RN-001: No simultaneidad docente
  const docenteConflict = sameSlot.find((a) => a.docenteId === candidate.docenteId);
  if (docenteConflict) {
    violations.push({
      rule: 'RN-001',
      message: `Docente ya asignado en ${candidate.dia} ${candidate.bloque}`,
    });
  }

  // RN-009: No simultaneidad aula
  const aulaConflict = sameSlot.find((a) => a.aulaId === candidate.aulaId);
  if (aulaConflict) {
    violations.push({
      rule: 'RN-009',
      message: `Aula ya ocupada en ${candidate.dia} ${candidate.bloque}`,
    });
  }

  // RN-015: Cursos del mismo ciclo no se superponen
  const cicloConflict = sameSlot.find(
    (a) => a.ciclo === candidate.ciclo && a.grupoId !== candidate.grupoId,
  );
  if (cicloConflict) {
    violations.push({
      rule: 'RN-015',
      message: `Ciclo ${candidate.ciclo} ya tiene curso en ${candidate.dia} ${candidate.bloque}`,
    });
  }

  // RN-010: Capacidad aula >= estudiantes (skip for lab practice — students split into sub-groups)
  const isLabPractice = candidate.requiereLaboratorio && candidate.tipo === 'practico';
  if (candidate.aulaCapacidad < candidate.numEstudiantes && !isLabPractice) {
    violations.push({
      rule: 'RN-010',
      message: `Aula capacidad ${candidate.aulaCapacidad} < ${candidate.numEstudiantes} estudiantes`,
    });
  }

  // RN-011/012: Tipo aula compatible (only for practice sessions)
  if (candidate.requiereLaboratorio && candidate.tipo === 'practico' && candidate.aulaType === 'Aula Teórica') {
    violations.push({
      rule: 'RN-011',
      message: 'Curso requiere laboratorio pero aula es teórica',
    });
  }

  return violations;
}

export function validateMaxConsecutiveHours(
  existing: PartialAssignment[],
  candidate: PartialAssignment,
  maxConsecutive: number = 6,
): Violation[] {
  // RN-019: Max 6h consecutivas por ciclo/dia
  const sameCicloDia = existing.filter(
    (a) => a.ciclo === candidate.ciclo && a.dia === candidate.dia,
  );

  const allBloques = [...sameCicloDia.map((a) => a.bloque), candidate.bloque];
  const hours = allBloques
    .map((b) => parseInt(b.split(':')[0], 10))
    .sort((a, b) => a - b);

  let consecutive = 1;
  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === hours[i - 1] + 1) {
      consecutive++;
      if (consecutive > maxConsecutive) {
        return [{
          rule: 'RN-019',
          message: `Ciclo ${candidate.ciclo} excede ${maxConsecutive}h consecutivas en ${candidate.dia}`,
        }];
      }
    } else {
      consecutive = 1;
    }
  }

  return [];
}

export function validateTheoryPracticeSeparation(
  existing: PartialAssignment[],
  candidate: PartialAssignment,
): Violation[] {
  // RN-016/RN-020: El usuario indicó que sí se permite teoría y práctica consecutivas (ej. 2h teoría + 3h práctica seguidas)
  return [];
}

export function validateBuildingSeparation(
  existing: PartialAssignment[],
  candidate: PartialAssignment,
): Violation[] {
  // RN-008: Si son pabellones diferentes, debe haber al menos 1 bloque de separación
  if (!candidate.pabellon) return [];

  const sameDocenteDay = existing.filter(
    (a) => a.docenteId === candidate.docenteId && a.dia === candidate.dia
  );

  const candidateHour = parseInt(candidate.bloque.split(':')[0], 10);

  for (const a of sameDocenteDay) {
    if (!a.pabellon || a.pabellon === candidate.pabellon) continue;

    const existingHour = parseInt(a.bloque.split(':')[0], 10);
    if (Math.abs(candidateHour - existingHour) === 1) {
      return [{
        rule: 'RN-008',
        message: `Docente no puede cambiar del pabellón ${a.pabellon} al ${candidate.pabellon} en bloques consecutivos`,
      }];
    }
  }

  return [];
}
