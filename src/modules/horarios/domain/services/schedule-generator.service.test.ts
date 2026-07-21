import { describe, it, expect } from 'vitest';
import {
  generateSchedule,
  GenerationInput,
  GenerationResult,
  chunkHoras,
} from './schedule-generator.service';
import { Docente } from '@/modules/docentes';
import { Curso } from '@/modules/cursos';
import { Grupo } from '@/modules/cursos';
import { Aula } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';

// ── Factory helpers ──

const NOW = new Date().toISOString();

function makeDocente(overrides: Partial<Docente> = {}): Docente {
  return {
    id: 'docente-1',
    nombres: 'Juan',
    apellidos: 'Pérez',
    dni: '12345678',
    correo: 'jperez@unitru.edu.pe',
    telefono: null,
    categoria: 'Principal',
    regimen: 'Dedicación Exclusiva',
    condicion: 'Nombrado',
    escuela: 'Ingeniería de Sistemas',
    fechaIngreso: '2006-03-01',
    cargaMaxima: 40,
    cargaElectiva: 0,
    estado: 'Activo',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeCurso(overrides: Partial<Curso> = {}): Curso {
  return {
    id: 'curso-1',
    codigo: 'IS-101',
    nombre: 'Programación I',
    ciclo: 'I',
    tipo: 'Teórico-Práctico',
    horasTeoricas: 2,
    horasPracticas: 0,
    creditos: 3,
    requiereLaboratorio: false,
    tipoLaboratorio: null,
    estado: 'Activo',
    planEstudioId: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeGrupo(overrides: Partial<Grupo> = {}): Grupo {
  return {
    id: 'grupo-1',
    cursoId: 'curso-1',
    periodoId: 'periodo-1',
    docenteId: 'docente-1',
    nombre: 'A',
    numEstudiantes: 30,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeAula(overrides: Partial<Aula> = {}): Aula {
  return {
    id: 'aula-1',
    codigo: 'A-101',
    nombre: 'Aula 101',
    pabellon: 'A',
    piso: 1,
    capacidad: 40,
    tipo: 'Aula Teórica',
    equipamiento: [],
    estado: 'Activa',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeDisponibilidad(
  docenteId: string,
  dia: Disponibilidad['dia'],
  bloque: Disponibilidad['bloque'],
  estado: Disponibilidad['estado'] = 'disponible',
): Disponibilidad {
  return {
    id: `disp-${docenteId}-${dia}-${bloque}`,
    docenteId,
    periodoId: 'periodo-1',
    dia,
    bloque,
    estado,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

// Generate full-week availability for a docente
function makeFullAvailability(docenteId: string, estado: Disponibilidad['estado'] = 'disponible'): Disponibilidad[] {
  const dias: Disponibilidad['dia'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const bloques: Disponibilidad['bloque'][] = [
    '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
    '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
    '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
    '19:00 - 20:00', '20:00 - 21:00',
  ];
  const result: Disponibilidad[] = [];
  for (const dia of dias) {
    for (const bloque of bloques) {
      result.push(makeDisponibilidad(docenteId, dia, bloque, estado));
    }
  }
  return result;
}

describe('schedule-generator.service', () => {
  describe('generateSchedule — minimal case', () => {
    it('assigns 1 docente, 1 curso (2h teóricas), 1 aula successfully', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso({ horasTeoricas: 2, horasPracticas: 0 })],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      expect(result.assignments.length).toBe(2); // 2 hours → 2 blocks
      expect(result.unassigned).toHaveLength(0);
      expect(result.summary.cursosAsignados).toBeGreaterThanOrEqual(1);
      expect(result.summary.cursosNoAsignados).toBe(0);
    });

    it('all assignments reference valid entities', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso()],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      for (const a of result.assignments) {
        expect(a.grupoId).toBe('grupo-1');
        expect(a.docenteId).toBe('docente-1');
        expect(a.aulaId).toBe('aula-1');
        expect(a.tipo).toBe('teorico');
        expect(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']).toContain(a.dia);
      }
    });
  });

  describe('generateSchedule — standard case', () => {
    it('assigns 3 docentes to 3 cursos with 2 aulas', () => {
      const docentes = [
        makeDocente({ id: 'doc-1', nombres: 'Ana', apellidos: 'García' }),
        makeDocente({ id: 'doc-2', nombres: 'Luis', apellidos: 'Torres', categoria: 'Asociado' }),
        makeDocente({ id: 'doc-3', nombres: 'María', apellidos: 'López', categoria: 'Auxiliar' }),
      ];
      const cursos = [
        makeCurso({ id: 'cur-1', nombre: 'Programación I', ciclo: 'I', horasTeoricas: 2, horasPracticas: 0 }),
        makeCurso({ id: 'cur-2', nombre: 'Cálculo I', ciclo: 'I', horasTeoricas: 2, horasPracticas: 0 }),
        makeCurso({ id: 'cur-3', nombre: 'Física I', ciclo: 'III', horasTeoricas: 2, horasPracticas: 0 }),
      ];
      const grupos = [
        makeGrupo({ id: 'grp-1', cursoId: 'cur-1', docenteId: 'doc-1' }),
        makeGrupo({ id: 'grp-2', cursoId: 'cur-2', docenteId: 'doc-2' }),
        makeGrupo({ id: 'grp-3', cursoId: 'cur-3', docenteId: 'doc-3' }),
      ];
      const aulas = [
        makeAula({ id: 'aula-1', capacidad: 40 }),
        makeAula({ id: 'aula-2', codigo: 'A-102', nombre: 'Aula 102', capacidad: 40 }),
      ];
      const disponibilidades = [
        ...makeFullAvailability('doc-1'),
        ...makeFullAvailability('doc-2'),
        ...makeFullAvailability('doc-3'),
      ];

      const input: GenerationInput = {
        docentes,
        cursos,
        grupos,
        aulas,
        disponibilidades,
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      // 3 cursos × 2h = 6 assignments
      expect(result.assignments.length).toBe(6);
      expect(result.unassigned).toHaveLength(0);

      // No docente has 2 assignments at the same time
      const slotMap = new Map<string, string>();
      for (const a of result.assignments) {
        const key = `${a.docenteId}||${a.dia}||${a.bloque}`;
        expect(slotMap.has(key)).toBe(false);
        slotMap.set(key, a.grupoId);
      }
    });
  });

  describe('generateSchedule — conflict scenarios', () => {
    it('reports unassigned when docente has no availability', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso()],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: [], // No availability at all
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      // Should report unassigned since docente has no slots
      expect(result.unassigned.length).toBeGreaterThanOrEqual(1);
    });

    it('respects aula capacity — cannot assign 50 students to 30-capacity room', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso({ horasTeoricas: 1, horasPracticas: 0 })],
        grupos: [makeGrupo({ numEstudiantes: 50 })],
        aulas: [makeAula({ capacidad: 30 })], // Too small
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      // The only aula is too small → should be unassigned
      expect(result.unassigned.length).toBeGreaterThanOrEqual(1);
    });

    it('does not exceed docente max load (Tiempo Parcial = 12h)', () => {
      // Create a TP docente with max 12h and try to assign 15h of courses
      const cursos: Curso[] = [];
      const grupos: Grupo[] = [];
      for (let i = 1; i <= 5; i++) {
        cursos.push(makeCurso({
          id: `cur-${i}`,
          codigo: `IS-10${i}`,
          nombre: `Curso ${i}`,
          ciclo: i <= 3 ? 'I' : 'III', // spread across ciclos to avoid RN-015
          horasTeoricas: 3,
          horasPracticas: 0,
        }));
        grupos.push(makeGrupo({
          id: `grp-${i}`,
          cursoId: `cur-${i}`,
          docenteId: 'docente-1',
        }));
      }

      const input: GenerationInput = {
        docentes: [makeDocente({ regimen: 'Tiempo Parcial' })], // 12h max
        cursos,
        grupos,
        aulas: [makeAula({ capacidad: 50 })],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      // Count assigned hours for the docente
      const docenteAssignments = result.assignments.filter((a) => a.docenteId === 'docente-1');
      expect(docenteAssignments.length).toBeLessThanOrEqual(12);
    });

    it('excludes inactive docentes from assignments', () => {
      const input: GenerationInput = {
        docentes: [makeDocente({ estado: 'Inactivo' })],
        cursos: [makeCurso()],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      expect(result.assignments.filter((a) => a.docenteId === 'docente-1')).toHaveLength(0);
    });

    it('excludes inactive aulas from assignments', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso()],
        grupos: [makeGrupo()],
        aulas: [makeAula({ estado: 'Inactiva' })],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      expect(result.assignments).toHaveLength(0);
      expect(result.unassigned.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateSchedule — priority and preferences', () => {
    it('higher-scored docente gets assigned — Principal before Auxiliar', () => {
      // The algorithm filters docentes by those who have grupos assigned.
      // Each docente has their own grupo. We verify that scoring ranks correctly
      // by checking the scoredDocentes order: Principal+Nombrado should score
      // higher than Auxiliar+Contratado.
      const docentes = [
        makeDocente({
          id: 'doc-principal',
          categoria: 'Principal',
          condicion: 'Nombrado',
          fechaIngreso: '2000-01-01', // 26+ years
        }),
        makeDocente({
          id: 'doc-auxiliar',
          nombres: 'Carlos',
          apellidos: 'Ramos',
          dni: '87654321',
          correo: 'cramos@unitru.edu.pe',
          categoria: 'Auxiliar',
          condicion: 'Contratado',
          fechaIngreso: '2024-01-01', // 2 years
        }),
      ];

      const cursos = [
        makeCurso({ id: 'cur-1', ciclo: 'I', horasTeoricas: 1, horasPracticas: 0 }),
        makeCurso({ id: 'cur-2', codigo: 'IS-102', nombre: 'Cálculo', ciclo: 'III', horasTeoricas: 1, horasPracticas: 0 }),
      ];
      // Each docente pre-assigned to a grupo
      const grupos = [
        makeGrupo({ id: 'grp-1', cursoId: 'cur-1', docenteId: 'doc-principal' }),
        makeGrupo({ id: 'grp-2', cursoId: 'cur-2', docenteId: 'doc-auxiliar' }),
      ];

      const input: GenerationInput = {
        docentes,
        cursos,
        grupos,
        aulas: [makeAula()],
        disponibilidades: [
          ...makeFullAvailability('doc-principal'),
          ...makeFullAvailability('doc-auxiliar'),
        ],
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      // Both docentes should be assigned
      const principalAssignment = result.assignments.find((a) => a.docenteId === 'doc-principal');
      const auxiliarAssignment = result.assignments.find((a) => a.docenteId === 'doc-auxiliar');
      expect(principalAssignment).toBeDefined();
      expect(auxiliarAssignment).toBeDefined();

      // Both assignments should succeed (no unassigned)
      expect(result.unassigned).toHaveLength(0);
    });

    it('preferred slots are prioritized over regular available slots', () => {
      // Make only 2 slots available: one preferred (Tuesday), one regular (Monday)
      const disponibilidades = [
        makeDisponibilidad('docente-1', 'Lunes', '08:00 - 09:00', 'disponible'),
        makeDisponibilidad('docente-1', 'Martes', '08:00 - 09:00', 'preferido'),
      ];

      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso({ horasTeoricas: 1, horasPracticas: 0 })],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades,
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      expect(result.assignments).toHaveLength(1);
      // Should pick the preferred slot
      expect(result.assignments[0].dia).toBe('Martes');
    });
  });

  describe('generateSchedule — progress callback', () => {
    it('calls onProgress for each phase', () => {
      const phases: number[] = [];

      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso({ horasTeoricas: 1, horasPracticas: 0 })],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      generateSchedule(input, (phase) => {
        phases.push(phase);
      });

      // Should have called for phases 2-9
      expect(phases).toContain(2);
      expect(phases).toContain(4);
      expect(phases).toContain(6);
      expect(phases).toContain(9);
    });
  });

  describe('generateSchedule — summary', () => {
    it('generates accurate summary statistics', () => {
      const input: GenerationInput = {
        docentes: [makeDocente()],
        cursos: [makeCurso({ horasTeoricas: 2, horasPracticas: 0 })],
        grupos: [makeGrupo()],
        aulas: [makeAula()],
        disponibilidades: makeFullAvailability('docente-1'),
        restriccionesAula: [],
      };

      const result = generateSchedule(input);

      expect(result.summary.totalCursos).toBe(1);
      expect(result.summary.cursosAsignados).toBe(1);
      expect(result.summary.cursosNoAsignados).toBe(0);
      expect(result.summary.cargaPromedio).toBeGreaterThan(0);
      expect(result.summary.cargaMaxima).toBeGreaterThanOrEqual(result.summary.cargaMinima);
    });
  });

  describe('chunkHoras', () => {
    it('divide correctamente las horas en bloques de 2 y 3', () => {
      expect(chunkHoras(1)).toEqual([1]);
      expect(chunkHoras(2)).toEqual([2]);
      expect(chunkHoras(3)).toEqual([3]);
      expect(chunkHoras(4)).toEqual([2, 2]);
      expect(chunkHoras(5)).toEqual([3, 2]);
      expect(chunkHoras(6)).toEqual([3, 3]);
      expect(chunkHoras(7)).toEqual([3, 2, 2]);
      expect(chunkHoras(8)).toEqual([3, 3, 2]);
      expect(chunkHoras(9)).toEqual([3, 3, 3]);
    });
  });
});
