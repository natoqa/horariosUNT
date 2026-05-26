import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePeriodoStateUseCase } from './change-periodo-state.use-case';
import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { Periodo } from '../../domain/entities/periodo.entity';
import { EstadoPeriodo } from '@/shared/constants/period-states';

function makePeriodo(state: EstadoPeriodo): Periodo {
  return {
    id: 'uuid-123',
    name: '2026-I',
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    availabilityDeadline: '2026-07-15',
    state,
    createdAt: '2026-05-25T00:00:00Z',
    updatedAt: '2026-05-25T00:00:00Z',
  };
}

function createMockRepo(
  periodo: Periodo | null = makePeriodo('Configuración'),
): IPeriodoRepository {
  return {
    findById: vi.fn().mockResolvedValue(periodo),
    findAll: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    update: vi.fn(),
    updateState: vi.fn().mockImplementation((_id, newState) =>
      Promise.resolve({ ...periodo!, state: newState }),
    ),
  };
}

describe('ChangePeriodoStateUseCase', () => {
  let useCase: ChangePeriodoStateUseCase;
  let mockRepo: IPeriodoRepository;

  // RN-022: Transiciones válidas secuenciales
  describe('transiciones válidas', () => {
    it('Configuración → Recopilación', async () => {
      mockRepo = createMockRepo(makePeriodo('Configuración'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Recopilación',
      });

      expect(mockRepo.updateState).toHaveBeenCalledWith(
        'uuid-123',
        'Recopilación',
      );
      expect(result.state).toBe('Recopilación');
    });

    it('Recopilación → Generación', async () => {
      mockRepo = createMockRepo(makePeriodo('Recopilación'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Generación',
      });

      expect(result.state).toBe('Generación');
    });

    it('Generación → Aprobado', async () => {
      mockRepo = createMockRepo(makePeriodo('Generación'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Aprobado',
      });

      expect(result.state).toBe('Aprobado');
    });

    it('Aprobado → Publicado', async () => {
      mockRepo = createMockRepo(makePeriodo('Aprobado'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Publicado',
      });

      expect(result.state).toBe('Publicado');
    });

    it('Publicado → Cerrado', async () => {
      mockRepo = createMockRepo(makePeriodo('Publicado'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Cerrado',
      });

      expect(result.state).toBe('Cerrado');
    });

    // RN-022: Excepción — retroceso permitido
    it('Generación → Recopilación (retroceso permitido RN-022)', async () => {
      mockRepo = createMockRepo(makePeriodo('Generación'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      const result = await useCase.execute({
        periodoId: 'uuid-123',
        newState: 'Recopilación',
      });

      expect(result.state).toBe('Recopilación');
    });
  });

  // RN-022: Transiciones inválidas
  describe('transiciones inválidas', () => {
    it('rechaza Configuración → Generación (salto)', async () => {
      mockRepo = createMockRepo(makePeriodo('Configuración'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({ periodoId: 'uuid-123', newState: 'Generación' }),
      ).rejects.toThrow('Transición no permitida');
    });

    it('rechaza Recopilación → Aprobado (salto)', async () => {
      mockRepo = createMockRepo(makePeriodo('Recopilación'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({ periodoId: 'uuid-123', newState: 'Aprobado' }),
      ).rejects.toThrow('Transición no permitida');
    });

    it('rechaza Aprobado → Generación (retroceso no permitido)', async () => {
      mockRepo = createMockRepo(makePeriodo('Aprobado'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({ periodoId: 'uuid-123', newState: 'Generación' }),
      ).rejects.toThrow('Transición no permitida');
    });

    it('rechaza Cerrado → Configuración (estado terminal)', async () => {
      mockRepo = createMockRepo(makePeriodo('Cerrado'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({
          periodoId: 'uuid-123',
          newState: 'Configuración',
        }),
      ).rejects.toThrow('Transición no permitida');
    });

    it('rechaza Publicado → Aprobado (retroceso no permitido)', async () => {
      mockRepo = createMockRepo(makePeriodo('Publicado'));
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({ periodoId: 'uuid-123', newState: 'Aprobado' }),
      ).rejects.toThrow('Transición no permitida');
    });
  });

  // Caso borde: período no encontrado
  describe('casos de error', () => {
    it('rechaza si el período no existe', async () => {
      mockRepo = createMockRepo(null);
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({
          periodoId: 'nonexistent',
          newState: 'Recopilación',
        }),
      ).rejects.toThrow('Período no encontrado');
      expect(mockRepo.updateState).not.toHaveBeenCalled();
    });

    it('rechaza con ID vacío (validación Zod)', async () => {
      mockRepo = createMockRepo();
      useCase = new ChangePeriodoStateUseCase(mockRepo);

      await expect(
        useCase.execute({ periodoId: '', newState: 'Recopilación' }),
      ).rejects.toThrow();
    });
  });
});
