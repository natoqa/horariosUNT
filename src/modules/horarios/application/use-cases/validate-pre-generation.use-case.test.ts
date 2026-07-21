import { describe, it, expect } from 'vitest';
import {
  ValidatePreGenerationUseCase,
  PreValidationResult,
} from './validate-pre-generation.use-case';
import { Periodo } from '@/modules/periodos/domain/entities/periodo.entity';
import { Docente } from '@/modules/docentes';
import { Curso } from '@/modules/cursos';
import { Grupo } from '@/modules/cursos';
import { Aula } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';

const NOW = new Date().toISOString();

function makePeriodo(overrides: Partial<Periodo> = {}): Periodo {
  return {
    id: 'periodo-1',
    name: '2026-I',
    tipoCiclo: 'Impar',
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    availabilityDeadline: '2026-07-15',
    state: 'Generación',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

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
    fechaIngreso: '2010-03-01',
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
    tipo: 'Teórico',
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

function makeDisponibilidad(overrides: Partial<Disponibilidad> = {}): Disponibilidad {
  return {
    id: 'disp-1',
    docenteId: 'docente-1',
    periodoId: 'periodo-1',
    dia: 'Lunes',
    bloque: '08:00 - 09:00',
    estado: 'disponible',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('ValidatePreGenerationUseCase', () => {
  const useCase = new ValidatePreGenerationUseCase();

  const validInputs = () => ({
    periodo: makePeriodo(),
    docentes: [makeDocente()],
    cursos: [makeCurso()],
    grupos: [makeGrupo()],
    aulas: [makeAula()],
    disponibilidades: [makeDisponibilidad()],
    force: false,
  });

  it('returns valid when all data is complete', () => {
    const { periodo, docentes, cursos, grupos, aulas, disponibilidades, force } = validInputs();
    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, force);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stats.totalDocentes).toBe(1);
    expect(result.stats.docentesConDisponibilidad).toBe(1);
    expect(result.stats.totalCursos).toBe(1);
    expect(result.stats.totalGrupos).toBe(1);
    expect(result.stats.totalAulas).toBe(1);
  });

  it('rejects when periodo is not in "Generación" state', () => {
    const { docentes, cursos, grupos, aulas, disponibilidades, force } = validInputs();
    const periodo = makePeriodo({ state: 'Recopilación' });

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, force);

    expect(result.valid).toBe(false);
    const periodoError = result.errors.find((e) => e.category === 'periodo');
    expect(periodoError).toBeDefined();
    expect(periodoError!.message).toContain('Generación');
  });

  it('rejects when there are no active docentes with assigned grupos', () => {
    const { periodo, cursos, grupos, aulas, disponibilidades, force } = validInputs();
    // Docente is inactive
    const docentes = [makeDocente({ estado: 'Inactivo' })];

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, force);

    expect(result.valid).toBe(false);
    const docenteError = result.errors.find((e) => e.category === 'docentes');
    expect(docenteError).toBeDefined();
  });

  it('rejects when there are no active cursos', () => {
    const { periodo, docentes, grupos, aulas, disponibilidades, force } = validInputs();
    const cursos = [makeCurso({ estado: 'Inactivo' })];

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, force);

    expect(result.valid).toBe(false);
    const cursoError = result.errors.find((e) => e.category === 'cursos');
    expect(cursoError).toBeDefined();
  });

  it('rejects when there are no grupos', () => {
    const { periodo, docentes, cursos, aulas, disponibilidades, force } = validInputs();

    const result = useCase.execute(periodo, docentes, cursos, [], aulas, disponibilidades, force);

    expect(result.valid).toBe(false);
    const cursoError = result.errors.find(
      (e) => e.category === 'cursos' && e.message.toLowerCase().includes('grupo'),
    );
    expect(cursoError).toBeDefined();
  });

  it('rejects when there are no active aulas', () => {
    const { periodo, docentes, cursos, grupos, disponibilidades, force } = validInputs();
    const aulas = [makeAula({ estado: 'Inactiva' })];

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, force);

    expect(result.valid).toBe(false);
    const aulaError = result.errors.find((e) => e.category === 'aulas');
    expect(aulaError).toBeDefined();
  });

  it('rejects docentes without availability when force=false', () => {
    const { periodo, docentes, cursos, grupos, aulas } = validInputs();
    // No disponibilidades
    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, [], false);

    expect(result.valid).toBe(false);
    const docenteError = result.errors.find(
      (e) => e.category === 'docentes' && e.message.includes('disponibilidad'),
    );
    expect(docenteError).toBeDefined();
  });

  it('allows docentes without availability when force=true', () => {
    const { periodo, docentes, cursos, grupos, aulas } = validInputs();
    // No disponibilidades, but force=true
    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, [], true);

    // Should not have a disponibilidad error (may still have other issues)
    const docenteDispError = result.errors.find(
      (e) => e.category === 'docentes' && e.message.includes('disponibilidad'),
    );
    expect(docenteDispError).toBeUndefined();
  });

  it('reports multiple errors simultaneously', () => {
    const periodo = makePeriodo({ state: 'Configuración' });
    const docentes: Docente[] = [];
    const cursos: Curso[] = [];
    const grupos: Grupo[] = [];
    const aulas: Aula[] = [];
    const disponibilidades: Disponibilidad[] = [];

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, false);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3); // periodo + docentes + cursos + grupos + aulas
  });

  it('stats count only active docentes with assigned grupos', () => {
    const periodo = makePeriodo();
    const docentes = [
      makeDocente({ id: 'doc-1', estado: 'Activo' }),
      makeDocente({ id: 'doc-2', estado: 'Inactivo', dni: '99999999', correo: 'other@test.com' }),
      makeDocente({ id: 'doc-3', estado: 'Activo', dni: '88888888', correo: 'third@test.com' }),
    ];
    // Only doc-1 has a grupo assigned
    const grupos = [makeGrupo({ docenteId: 'doc-1' })];
    const cursos = [makeCurso()];
    const aulas = [makeAula()];
    const disponibilidades = [makeDisponibilidad({ docenteId: 'doc-1' })];

    const result = useCase.execute(periodo, docentes, cursos, grupos, aulas, disponibilidades, false);

    expect(result.stats.totalDocentes).toBe(1); // Only doc-1 (active + has grupo)
    expect(result.stats.docentesConDisponibilidad).toBe(1);
  });
});
