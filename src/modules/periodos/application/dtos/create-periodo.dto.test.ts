import { describe, it, expect } from 'vitest';
import { createPeriodoSchema } from './create-periodo.dto';

const VALID_DTO = {
  name: '2026-I',
  startDate: '2026-08-01',
  endDate: '2026-12-15',
  availabilityDeadline: '2026-07-15',
};

describe('createPeriodoSchema', () => {
  // Happy path
  it('acepta datos válidos', () => {
    const result = createPeriodoSchema.safeParse(VALID_DTO);
    expect(result.success).toBe(true);
  });

  // RF-059: nombre requerido
  it('rechaza nombre menor a 3 caracteres', () => {
    const result = createPeriodoSchema.safeParse({ ...VALID_DTO, name: 'AB' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    const result = createPeriodoSchema.safeParse({ ...VALID_DTO, name: '' });
    expect(result.success).toBe(false);
  });

  // RF-059: fechas requeridas
  it('rechaza fecha de inicio vacía', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      startDate: '',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza fecha de fin vacía', () => {
    const result = createPeriodoSchema.safeParse({ ...VALID_DTO, endDate: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza fecha límite vacía', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      availabilityDeadline: '',
    });
    expect(result.success).toBe(false);
  });

  // Validación: startDate < endDate
  it('rechaza cuando fecha de inicio es posterior a fecha de fin', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      startDate: '2026-12-20',
      endDate: '2026-08-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors;
      expect(issues.endDate).toBeDefined();
    }
  });

  it('rechaza cuando fecha de inicio es igual a fecha de fin', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      startDate: '2026-08-01',
      endDate: '2026-08-01',
    });
    expect(result.success).toBe(false);
  });

  // RN-023: fecha límite de disponibilidad < fecha de inicio
  it('rechaza cuando fecha límite es posterior a fecha de inicio', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      availabilityDeadline: '2026-09-01',
      startDate: '2026-08-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors;
      expect(issues.availabilityDeadline).toBeDefined();
    }
  });

  it('rechaza cuando fecha límite es igual a fecha de inicio (RN-023)', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      availabilityDeadline: '2026-08-01',
      startDate: '2026-08-01',
    });
    expect(result.success).toBe(false);
  });

  it('acepta fecha límite un día antes de inicio', () => {
    const result = createPeriodoSchema.safeParse({
      ...VALID_DTO,
      availabilityDeadline: '2026-07-31',
      startDate: '2026-08-01',
    });
    expect(result.success).toBe(true);
  });
});
