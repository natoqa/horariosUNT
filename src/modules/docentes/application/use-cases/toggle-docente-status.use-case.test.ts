import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleDocenteStatusUseCase } from './toggle-docente-status.use-case';
import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

const ACTIVE_DOCENTE: Docente = {
  id: 'uuid-123',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez Rojas',
  dni: '12345678',
  correo: 'jperez@unitru.edu.pe',
  telefono: '987654321',
  categoria: 'Asociado',
  regimen: 'Tiempo Completo',
  condicion: 'Nombrado',
  fechaIngreso: '2015-03-15',
  cargaMaxima: 20,
  estado: 'Activo',
  createdAt: '2026-05-25T00:00:00Z',
  updatedAt: '2026-05-25T00:00:00Z',
};

function createMockRepo(
  docente: Docente | null = ACTIVE_DOCENTE,
): IDocenteRepository {
  return {
    findById: vi.fn().mockResolvedValue(docente),
    findAll: vi.fn().mockResolvedValue([]),
    findByDni: vi.fn().mockResolvedValue(null),
    findByCorreo: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    update: vi.fn().mockImplementation((_id, data) =>
      Promise.resolve({ ...docente!, ...data }),
    ),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ToggleDocenteStatusUseCase', () => {
  let useCase: ToggleDocenteStatusUseCase;
  let mockRepo: IDocenteRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new ToggleDocenteStatusUseCase(mockRepo);
  });

  it('desactiva un docente activo (HU-017)', async () => {
    const result = await useCase.execute('uuid-123');

    expect(mockRepo.update).toHaveBeenCalledWith('uuid-123', { estado: 'Inactivo' });
    expect(result.estado).toBe('Inactivo');
  });

  it('activa un docente inactivo', async () => {
    mockRepo = createMockRepo({ ...ACTIVE_DOCENTE, estado: 'Inactivo' });
    useCase = new ToggleDocenteStatusUseCase(mockRepo);

    const result = await useCase.execute('uuid-123');

    expect(mockRepo.update).toHaveBeenCalledWith('uuid-123', { estado: 'Activo' });
    expect(result.estado).toBe('Activo');
  });

  it('rechaza si el docente no existe', async () => {
    mockRepo = createMockRepo(null);
    useCase = new ToggleDocenteStatusUseCase(mockRepo);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      'Docente no encontrado',
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('rechaza con ID vacío', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'El ID del docente es requerido',
    );
  });
});
