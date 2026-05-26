import { describe, it, expect } from 'vitest';
import { calcularAntiguedad, getCargaMaximaDefault } from './docente.entity';

describe('calcularAntiguedad', () => {
  it('retorna 0 para fecha de ingreso reciente', () => {
    const hoy = new Date();
    const fechaReciente = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());
    expect(calcularAntiguedad(fechaReciente.toISOString())).toBe(0);
  });

  it('calcula correctamente años de antigüedad', () => {
    const cincoAniosAtras = new Date();
    cincoAniosAtras.setFullYear(cincoAniosAtras.getFullYear() - 5);
    cincoAniosAtras.setMonth(cincoAniosAtras.getMonth() - 1);
    expect(calcularAntiguedad(cincoAniosAtras.toISOString())).toBe(5);
  });

  it('retorna 10 para fecha de 10 años atrás', () => {
    const diezAniosAtras = new Date();
    diezAniosAtras.setFullYear(diezAniosAtras.getFullYear() - 10);
    diezAniosAtras.setMonth(diezAniosAtras.getMonth() - 1);
    expect(calcularAntiguedad(diezAniosAtras.toISOString())).toBe(10);
  });
});

describe('getCargaMaximaDefault', () => {
  it('retorna 40 para Dedicación Exclusiva', () => {
    expect(getCargaMaximaDefault('Dedicación Exclusiva')).toBe(40);
  });

  it('retorna 20 para Tiempo Completo', () => {
    expect(getCargaMaximaDefault('Tiempo Completo')).toBe(20);
  });

  it('retorna 12 para Tiempo Parcial', () => {
    expect(getCargaMaximaDefault('Tiempo Parcial')).toBe(12);
  });
});
