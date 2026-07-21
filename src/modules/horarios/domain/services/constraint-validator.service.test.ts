import { describe, it, expect } from 'vitest';
import {
  validateHardConstraints,
  validateMaxConsecutiveHours,
  PartialAssignment,
} from './constraint-validator.service';

// Helper to create a partial assignment with sensible defaults
function makeAssignment(overrides: Partial<PartialAssignment> = {}): PartialAssignment {
  return {
    grupoId: 'grupo-1',
    docenteId: 'docente-1',
    aulaId: 'aula-1',
    dia: 'Lunes',
    bloque: '08:00 - 09:00',
    tipo: 'teorico',
    ciclo: 'I',
    aulaCapacidad: 40,
    numEstudiantes: 30,
    aulaType: 'Aula Teórica',
    requiereLaboratorio: false,
    ...overrides,
  };
}

describe('constraint-validator.service', () => {
  describe('validateHardConstraints', () => {
    it('returns no violations when there are no conflicts', () => {
      const existing: PartialAssignment[] = [];
      const candidate = makeAssignment();

      const violations = validateHardConstraints(existing, candidate);
      expect(violations).toHaveLength(0);
    });

    it('RN-001: detects docente double-booking (same docente, same slot)', () => {
      const existing = [makeAssignment({ grupoId: 'grupo-2' })];
      const candidate = makeAssignment({
        grupoId: 'grupo-3',
        aulaId: 'aula-2',
        ciclo: 'III', // different ciclo to isolate this violation
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn001 = violations.find((v) => v.rule === 'RN-001');
      expect(rn001).toBeDefined();
      expect(rn001!.message).toContain('Docente ya asignado');
    });

    it('RN-001: no violation when same docente is in different time slots', () => {
      const existing = [makeAssignment({ bloque: '09:00 - 10:00' })];
      const candidate = makeAssignment({
        grupoId: 'grupo-2',
        bloque: '10:00 - 11:00',
        aulaId: 'aula-2',
        ciclo: 'III',
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn001 = violations.find((v) => v.rule === 'RN-001');
      expect(rn001).toBeUndefined();
    });

    it('RN-009: detects aula double-booking (same aula, same slot)', () => {
      const existing = [makeAssignment({ docenteId: 'docente-2', grupoId: 'grupo-2', ciclo: 'III' })];
      const candidate = makeAssignment({
        grupoId: 'grupo-3',
        docenteId: 'docente-3',
        ciclo: 'V',
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn009 = violations.find((v) => v.rule === 'RN-009');
      expect(rn009).toBeDefined();
      expect(rn009!.message).toContain('Aula ya ocupada');
    });

    it('RN-009: no violation when same aula is in different days', () => {
      const existing = [makeAssignment({ dia: 'Martes' })];
      const candidate = makeAssignment({
        grupoId: 'grupo-2',
        docenteId: 'docente-2',
        dia: 'Miércoles',
        ciclo: 'III',
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn009 = violations.find((v) => v.rule === 'RN-009');
      expect(rn009).toBeUndefined();
    });

    it('RN-015: detects same-ciclo course overlap', () => {
      const existing = [
        makeAssignment({
          docenteId: 'docente-2',
          aulaId: 'aula-2',
          grupoId: 'grupo-2',
          ciclo: 'I',
        }),
      ];
      const candidate = makeAssignment({
        docenteId: 'docente-3',
        aulaId: 'aula-3',
        grupoId: 'grupo-3',
        ciclo: 'I', // same ciclo
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn015 = violations.find((v) => v.rule === 'RN-015');
      expect(rn015).toBeDefined();
      expect(rn015!.message).toContain('Ciclo I');
    });

    it('RN-015: no violation when different ciclos overlap', () => {
      const existing = [
        makeAssignment({
          docenteId: 'docente-2',
          aulaId: 'aula-2',
          grupoId: 'grupo-2',
          ciclo: 'III',
        }),
      ];
      const candidate = makeAssignment({
        docenteId: 'docente-3',
        aulaId: 'aula-3',
        grupoId: 'grupo-3',
        ciclo: 'V', // different ciclo
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn015 = violations.find((v) => v.rule === 'RN-015');
      expect(rn015).toBeUndefined();
    });

    it('RN-015: same grupo in same ciclo is NOT a violation (self-reference)', () => {
      const existing = [makeAssignment({ grupoId: 'grupo-1', ciclo: 'I' })];
      // Same grupoId — this should NOT trigger RN-015
      const candidate = makeAssignment({
        grupoId: 'grupo-1',
        ciclo: 'I',
        docenteId: 'docente-2',
        aulaId: 'aula-2',
      });

      const violations = validateHardConstraints(existing, candidate);
      const rn015 = violations.find((v) => v.rule === 'RN-015');
      expect(rn015).toBeUndefined();
    });

    it('RN-010: detects insufficient aula capacity', () => {
      const candidate = makeAssignment({
        aulaCapacidad: 20,
        numEstudiantes: 35,
      });

      const violations = validateHardConstraints([], candidate);
      const rn010 = violations.find((v) => v.rule === 'RN-010');
      expect(rn010).toBeDefined();
      expect(rn010!.message).toContain('20');
      expect(rn010!.message).toContain('35');
    });

    it('RN-010: no violation when capacity is sufficient', () => {
      const candidate = makeAssignment({
        aulaCapacidad: 40,
        numEstudiantes: 30,
      });

      const violations = validateHardConstraints([], candidate);
      const rn010 = violations.find((v) => v.rule === 'RN-010');
      expect(rn010).toBeUndefined();
    });

    it('RN-010: skips capacity check for lab practice (students split into sub-groups)', () => {
      const candidate = makeAssignment({
        aulaCapacidad: 20,
        numEstudiantes: 35,
        requiereLaboratorio: true,
        tipo: 'practico',
        aulaType: 'Laboratorio de Cómputo',
      });

      const violations = validateHardConstraints([], candidate);
      const rn010 = violations.find((v) => v.rule === 'RN-010');
      expect(rn010).toBeUndefined();
    });

    it('RN-011: detects lab course assigned to theoretical room', () => {
      const candidate = makeAssignment({
        requiereLaboratorio: true,
        tipo: 'practico',
        aulaType: 'Aula Teórica',
      });

      const violations = validateHardConstraints([], candidate);
      const rn011 = violations.find((v) => v.rule === 'RN-011');
      expect(rn011).toBeDefined();
    });

    it('RN-011: no violation for lab course in lab room', () => {
      const candidate = makeAssignment({
        requiereLaboratorio: true,
        tipo: 'practico',
        aulaType: 'Laboratorio de Cómputo',
      });

      const violations = validateHardConstraints([], candidate);
      const rn011 = violations.find((v) => v.rule === 'RN-011');
      expect(rn011).toBeUndefined();
    });

    it('RN-011: only applies to practice sessions, not theory', () => {
      const candidate = makeAssignment({
        requiereLaboratorio: true,
        tipo: 'teorico', // theory session of a course that requires lab
        aulaType: 'Aula Teórica',
      });

      const violations = validateHardConstraints([], candidate);
      const rn011 = violations.find((v) => v.rule === 'RN-011');
      expect(rn011).toBeUndefined();
    });

    it('detects multiple violations simultaneously', () => {
      const existing = [
        makeAssignment({
          grupoId: 'grupo-2',
          ciclo: 'I',
        }),
      ];
      // Same docente (RN-001), same aula (RN-009), same ciclo (RN-015)
      const candidate = makeAssignment({
        grupoId: 'grupo-3',
        ciclo: 'I',
      });

      const violations = validateHardConstraints(existing, candidate);
      expect(violations.length).toBeGreaterThanOrEqual(3);
      expect(violations.some((v) => v.rule === 'RN-001')).toBe(true);
      expect(violations.some((v) => v.rule === 'RN-009')).toBe(true);
      expect(violations.some((v) => v.rule === 'RN-015')).toBe(true);
    });
  });

  describe('validateMaxConsecutiveHours', () => {
    it('RN-019: allows up to 6 consecutive hours', () => {
      const existing: PartialAssignment[] = [
        makeAssignment({ bloque: '07:00 - 08:00' }),
        makeAssignment({ bloque: '08:00 - 09:00', grupoId: 'g2', docenteId: 'd2', aulaId: 'a2' }),
        makeAssignment({ bloque: '09:00 - 10:00', grupoId: 'g3', docenteId: 'd3', aulaId: 'a3' }),
        makeAssignment({ bloque: '10:00 - 11:00', grupoId: 'g4', docenteId: 'd4', aulaId: 'a4' }),
        makeAssignment({ bloque: '11:00 - 12:00', grupoId: 'g5', docenteId: 'd5', aulaId: 'a5' }),
      ];

      // 6th consecutive hour — should be allowed
      const candidate = makeAssignment({
        bloque: '12:00 - 13:00',
        grupoId: 'g6',
        docenteId: 'd6',
        aulaId: 'a6',
      });

      const violations = validateMaxConsecutiveHours(existing, candidate);
      expect(violations).toHaveLength(0);
    });

    it('RN-019: blocks 7th consecutive hour', () => {
      const existing: PartialAssignment[] = [
        makeAssignment({ bloque: '07:00 - 08:00' }),
        makeAssignment({ bloque: '08:00 - 09:00', grupoId: 'g2', docenteId: 'd2', aulaId: 'a2' }),
        makeAssignment({ bloque: '09:00 - 10:00', grupoId: 'g3', docenteId: 'd3', aulaId: 'a3' }),
        makeAssignment({ bloque: '10:00 - 11:00', grupoId: 'g4', docenteId: 'd4', aulaId: 'a4' }),
        makeAssignment({ bloque: '11:00 - 12:00', grupoId: 'g5', docenteId: 'd5', aulaId: 'a5' }),
        makeAssignment({ bloque: '12:00 - 13:00', grupoId: 'g6', docenteId: 'd6', aulaId: 'a6' }),
      ];

      // 7th consecutive hour — should be blocked
      const candidate = makeAssignment({
        bloque: '13:00 - 14:00',
        grupoId: 'g7',
        docenteId: 'd7',
        aulaId: 'a7',
      });

      const violations = validateMaxConsecutiveHours(existing, candidate);
      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('RN-019');
    });

    it('RN-019: only counts same ciclo and same day', () => {
      const existing: PartialAssignment[] = [
        makeAssignment({ bloque: '07:00 - 08:00', ciclo: 'I' }),
        makeAssignment({ bloque: '08:00 - 09:00', ciclo: 'I', grupoId: 'g2', docenteId: 'd2', aulaId: 'a2' }),
        makeAssignment({ bloque: '09:00 - 10:00', ciclo: 'I', grupoId: 'g3', docenteId: 'd3', aulaId: 'a3' }),
        makeAssignment({ bloque: '10:00 - 11:00', ciclo: 'III', grupoId: 'g4', docenteId: 'd4', aulaId: 'a4' }), // different ciclo
        makeAssignment({ bloque: '11:00 - 12:00', ciclo: 'I', dia: 'Martes', grupoId: 'g5', docenteId: 'd5', aulaId: 'a5' }), // different day
      ];

      // Only 3 consecutive in ciclo I on Lunes, plus this = 4. Should be fine.
      const candidate = makeAssignment({
        bloque: '10:00 - 11:00',
        ciclo: 'I',
        grupoId: 'g6',
        docenteId: 'd6',
        aulaId: 'a6',
      });

      const violations = validateMaxConsecutiveHours(existing, candidate);
      expect(violations).toHaveLength(0);
    });

    it('RN-019: non-consecutive hours do not count', () => {
      const existing: PartialAssignment[] = [
        makeAssignment({ bloque: '07:00 - 08:00' }),
        makeAssignment({ bloque: '08:00 - 09:00', grupoId: 'g2', docenteId: 'd2', aulaId: 'a2' }),
        // Gap at 09:00 - 10:00
        makeAssignment({ bloque: '10:00 - 11:00', grupoId: 'g3', docenteId: 'd3', aulaId: 'a3' }),
        makeAssignment({ bloque: '11:00 - 12:00', grupoId: 'g4', docenteId: 'd4', aulaId: 'a4' }),
        makeAssignment({ bloque: '12:00 - 13:00', grupoId: 'g5', docenteId: 'd5', aulaId: 'a5' }),
        makeAssignment({ bloque: '13:00 - 14:00', grupoId: 'g6', docenteId: 'd6', aulaId: 'a6' }),
      ];

      // Adding at 14:00, longest run is 10-14 = 5 consecutive, should be fine
      const candidate = makeAssignment({
        bloque: '14:00 - 15:00',
        grupoId: 'g7',
        docenteId: 'd7',
        aulaId: 'a7',
      });

      const violations = validateMaxConsecutiveHours(existing, candidate);
      expect(violations).toHaveLength(0);
    });
  });
});
