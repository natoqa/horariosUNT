import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePeriodoUseCase } from './create-periodo.use-case';
import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { Periodo } from '../../domain/entities/periodo.entity';

const VALID_DTO = {
  name: '2026-I',
  tipoCiclo: 'Impar' as const,
  startDate: '2026-08-01',
  endDate: '2026-12-15',
  availabilityDeadline: '2026-07-15',
};

const SAVED_PERIODO: Periodo = {
  id: 'uuid-123',
  name: '2026-I',
  tipoCiclo: 'Impar',
  startDate: '2026-08-01',
  endDate: '2026-12-15',
  availabilityDeadline: '2026-07-15',
  state: 'Configuración',
  createdAt: '2026-05-25T00:00:00Z',
  updatedAt: '2026-05-25T00:00:00Z',
};

function createMockRepo(
  overrides: Partial<IPeriodoRepository> = {},
): IPeriodoRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(SAVED_PERIODO),
    update: vi.fn().mockResolvedValue(SAVED_PERIODO),
    updateState: vi.fn().mockResolvedValue(SAVED_PERIODO),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreatePeriodoUseCase', () => {
  let useCase: CreatePeriodoUseCase;
  let mockRepo: IPeriodoRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new CreatePeriodoUseCase(mockRepo);
  });

  // Happy path
  it('crea un período en estado Configuración cuando no hay período activo', async () => {
    const result = await useCase.execute(VALID_DTO);

    expect(mockRepo.findActive).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalledWith({
      name: '2026-I',
      tipoCiclo: 'Impar',
      startDate: '2026-08-01',
      endDate: '2026-12-15',
      availabilityDeadline: '2026-07-15',
      state: 'Configuración',
    });
    expect(result.id).toBe('uuid-123');
    expect(result.state).toBe('Configuración');
  });

  // RF-061 / RN-021: no más de un período activo
  it('rechaza creación si ya existe un período activo (RF-061, RN-021)', async () => {
    const existingPeriodo: Periodo = {
      ...SAVED_PERIODO,
      id: 'existing-uuid',
      state: 'Recopilación',
    };
    mockRepo = createMockRepo({
      findActive: vi.fn().mockResolvedValue(existingPeriodo),
    });
    useCase = new CreatePeriodoUseCase(mockRepo);

    await expect(useCase.execute(VALID_DTO)).rejects.toThrow(
      'Ya existe un período académico activo',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  // Validación Zod — datos inválidos
  it('rechaza DTO con nombre vacío', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, name: '' }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza DTO con fechas incoherentes', async () => {
    await expect(
      useCase.execute({
        ...VALID_DTO,
        startDate: '2026-12-20',
        endDate: '2026-08-01',
      }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
