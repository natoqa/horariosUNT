import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDocenteUseCase } from './create-docente.use-case';
import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

const VALID_DTO = {
  nombres: 'Juan Carlos',
  apellidos: 'Pérez Rojas',
  dni: '12345678',
  correo: 'jperez@unitru.edu.pe',
  telefono: '987654321',
  categoria: 'Asociado' as const,
  regimen: 'Tiempo Completo' as const,
  condicion: 'Nombrado' as const,
  escuela: 'Ingeniería de Sistemas' as const,
  fechaIngreso: '2015-03-15',
  cargaMaxima: 20,
};

const SAVED_DOCENTE: Docente = {
  id: 'uuid-123',
  ...VALID_DTO,
  cargaElectiva: 0,
  estado: 'Activo',
  createdAt: '2026-05-25T00:00:00Z',
  updatedAt: '2026-05-25T00:00:00Z',
};

function createMockRepo(
  overrides: Partial<IDocenteRepository> = {},
): IDocenteRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    findByDni: vi.fn().mockResolvedValue(null),
    findByCorreo: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(SAVED_DOCENTE),
    update: vi.fn().mockResolvedValue(SAVED_DOCENTE),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreateDocenteUseCase', () => {
  let useCase: CreateDocenteUseCase;
  let mockRepo: IDocenteRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    useCase = new CreateDocenteUseCase(mockRepo);
  });

  it('crea un docente con datos válidos', async () => {
    const result = await useCase.execute(VALID_DTO);

    expect(mockRepo.findByDni).toHaveBeenCalledWith('12345678');
    expect(mockRepo.findByCorreo).toHaveBeenCalledWith('jperez@unitru.edu.pe');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombres: 'Juan Carlos',
        apellidos: 'Pérez Rojas',
        estado: 'Activo',
      }),
    );
    expect(result.id).toBe('uuid-123');
  });

  it('rechaza si el DNI ya existe (RF-009)', async () => {
    mockRepo = createMockRepo({
      findByDni: vi.fn().mockResolvedValue(SAVED_DOCENTE),
    });
    useCase = new CreateDocenteUseCase(mockRepo);

    await expect(useCase.execute(VALID_DTO)).rejects.toThrow(
      'Ya existe un docente con este DNI',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza si el correo ya existe (RF-009)', async () => {
    mockRepo = createMockRepo({
      findByCorreo: vi.fn().mockResolvedValue(SAVED_DOCENTE),
    });
    useCase = new CreateDocenteUseCase(mockRepo);

    await expect(useCase.execute(VALID_DTO)).rejects.toThrow(
      'Ya existe un docente con este correo',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza DTO con DNI inválido (menos de 8 dígitos)', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, dni: '1234' }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza DTO con correo inválido', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, correo: 'no-es-email' }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza DTO con nombres vacíos', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, nombres: '' }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza DTO con fecha de ingreso futura', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, fechaIngreso: '2030-01-01' }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza carga máxima mayor a 40', async () => {
    await expect(
      useCase.execute({ ...VALID_DTO, cargaMaxima: 50 }),
    ).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
