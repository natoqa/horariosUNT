import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDocenteUseCase } from './update-docente.use-case';
import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

const EXISTING_DOCENTE: Docente = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez Rojas',
  dni: '12345678',
  correo: 'jperez@unitru.edu.pe',
  telefono: '987654321',
  categoria: 'Asociado',
  regimen: 'Tiempo Completo',
  condicion: 'Nombrado',
  escuela: 'Ingeniería de Sistemas',
  fechaIngreso: '2015-03-15',
  cargaMaxima: 20,
  estado: 'Activo',
  createdAt: '2026-05-25T00:00:00Z',
  updatedAt: '2026-05-25T00:00:00Z',
};

function createMockRepo(
  overrides: Partial<IDocenteRepository> = {},
): IDocenteRepository {
  return {
    findById: vi.fn().mockResolvedValue(EXISTING_DOCENTE),
    findAll: vi.fn().mockResolvedValue([]),
    findByDni: vi.fn().mockResolvedValue(null),
    findByCorreo: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(EXISTING_DOCENTE),
    update: vi.fn().mockResolvedValue({ ...EXISTING_DOCENTE, nombres: 'Juan' }),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('UpdateDocenteUseCase', () => {
  let useCase: UpdateDocenteUseCase;
  let mockRepo: IDocenteRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new UpdateDocenteUseCase(mockRepo);
  });

  it('actualiza un docente existente', async () => {
    await useCase.execute({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', nombres: 'Juan' });

    expect(mockRepo.findById).toHaveBeenCalledWith('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(mockRepo.update).toHaveBeenCalledWith('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', { nombres: 'Juan' });
  });

  it('rechaza si el docente no existe', async () => {
    mockRepo = createMockRepo({
      findById: vi.fn().mockResolvedValue(null),
    });
    useCase = new UpdateDocenteUseCase(mockRepo);

    await expect(
      useCase.execute({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', nombres: 'Juan' }),
    ).rejects.toThrow('Docente no encontrado');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('rechaza si el nuevo correo ya está en uso', async () => {
    mockRepo = createMockRepo({
      findByCorreo: vi.fn().mockResolvedValue({ ...EXISTING_DOCENTE, id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' }),
    });
    useCase = new UpdateDocenteUseCase(mockRepo);

    await expect(
      useCase.execute({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', correo: 'otro@unitru.edu.pe' }),
    ).rejects.toThrow('Ya existe un docente con este correo');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('permite mantener el mismo correo sin error', async () => {
    await useCase.execute({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', correo: 'jperez@unitru.edu.pe' });

    expect(mockRepo.findByCorreo).not.toHaveBeenCalled();
    expect(mockRepo.update).toHaveBeenCalled();
  });

  it('rechaza con ID vacío', async () => {
    await expect(
      useCase.execute({ id: '', nombres: 'Juan' }),
    ).rejects.toThrow();
  });
});
