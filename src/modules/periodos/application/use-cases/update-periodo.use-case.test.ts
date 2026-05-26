import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdatePeriodoUseCase } from './update-periodo.use-case';
import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { Periodo } from '../../domain/entities/periodo.entity';

const EXISTING_PERIODO: Periodo = {
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

const VALID_UPDATE = {
  id: 'uuid-123',
  name: '2026-II',
  startDate: '2026-08-15',
  endDate: '2026-12-20',
  availabilityDeadline: '2026-08-01',
};

function createMockRepo(
  overrides: Partial<IPeriodoRepository> = {},
): IPeriodoRepository {
  return {
    findById: vi.fn().mockResolvedValue(EXISTING_PERIODO),
    findAll: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(EXISTING_PERIODO),
    update: vi.fn().mockResolvedValue({ ...EXISTING_PERIODO, ...VALID_UPDATE }),
    updateState: vi.fn().mockResolvedValue(EXISTING_PERIODO),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('UpdatePeriodoUseCase', () => {
  let useCase: UpdatePeriodoUseCase;
  let mockRepo: IPeriodoRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new UpdatePeriodoUseCase(mockRepo);
  });

  // Happy path
  it('actualiza un período en estado Configuración', async () => {
    await useCase.execute(VALID_UPDATE);

    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    expect(mockRepo.update).toHaveBeenCalledWith('uuid-123', {
      name: '2026-II',
      startDate: '2026-08-15',
      endDate: '2026-12-20',
      availabilityDeadline: '2026-08-01',
    });
  });

  // Período no encontrado
  it('rechaza si el período no existe', async () => {
    mockRepo = createMockRepo({
      findById: vi.fn().mockResolvedValue(null),
    });
    useCase = new UpdatePeriodoUseCase(mockRepo);

    await expect(useCase.execute(VALID_UPDATE)).rejects.toThrow(
      'Período no encontrado',
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  // Solo editable en Configuración
  it('rechaza edición si el período no está en Configuración', async () => {
    mockRepo = createMockRepo({
      findById: vi
        .fn()
        .mockResolvedValue({ ...EXISTING_PERIODO, state: 'Recopilación' }),
    });
    useCase = new UpdatePeriodoUseCase(mockRepo);

    await expect(useCase.execute(VALID_UPDATE)).rejects.toThrow(
      'Solo se puede editar un período en estado "Configuración"',
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('rechaza edición si el período está en Generación', async () => {
    mockRepo = createMockRepo({
      findById: vi
        .fn()
        .mockResolvedValue({ ...EXISTING_PERIODO, state: 'Generación' }),
    });
    useCase = new UpdatePeriodoUseCase(mockRepo);

    await expect(useCase.execute(VALID_UPDATE)).rejects.toThrow(
      'Solo se puede editar un período en estado "Configuración"',
    );
  });

  it('rechaza edición si el período está Cerrado', async () => {
    mockRepo = createMockRepo({
      findById: vi
        .fn()
        .mockResolvedValue({ ...EXISTING_PERIODO, state: 'Cerrado' }),
    });
    useCase = new UpdatePeriodoUseCase(mockRepo);

    await expect(useCase.execute(VALID_UPDATE)).rejects.toThrow(
      'Solo se puede editar un período en estado "Configuración"',
    );
  });
});
