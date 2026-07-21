import { describe, it, expect } from 'vitest';
import {
  calculateDocenteScore,
  getCategoriaValue,
  getAntiguedadValue,
  getDisponibilidadValue,
  getPreferenciaValue,
  getCargaValue,
  SCORING_WEIGHTS,
  DocenteScoreInput,
} from './scoring.entity';

describe('scoring.entity', () => {
  describe('SCORING_WEIGHTS', () => {
    it('weights should sum to 1.0', () => {
      const sum =
        SCORING_WEIGHTS.categoria +
        SCORING_WEIGHTS.antiguedad +
        SCORING_WEIGHTS.disponibilidad +
        SCORING_WEIGHTS.preferencia +
        SCORING_WEIGHTS.carga;
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe('getCategoriaValue', () => {
    it('Principal + Nombrado = 110', () => {
      expect(getCategoriaValue('Principal', 'Nombrado')).toBe(110);
    });

    it('Principal + Contratado = 100', () => {
      expect(getCategoriaValue('Principal', 'Contratado')).toBe(100);
    });

    it('Asociado + Nombrado = 80', () => {
      expect(getCategoriaValue('Asociado', 'Nombrado')).toBe(80);
    });

    it('Asociado + Contratado = 70', () => {
      expect(getCategoriaValue('Asociado', 'Contratado')).toBe(70);
    });

    it('Auxiliar + Nombrado = 50', () => {
      expect(getCategoriaValue('Auxiliar', 'Nombrado')).toBe(50);
    });

    it('Auxiliar + Contratado = 40', () => {
      expect(getCategoriaValue('Auxiliar', 'Contratado')).toBe(40);
    });
  });

  describe('getAntiguedadValue', () => {
    it('20+ años = 100', () => {
      expect(getAntiguedadValue(20)).toBe(100);
      expect(getAntiguedadValue(30)).toBe(100);
    });

    it('15-19 años = 80', () => {
      expect(getAntiguedadValue(15)).toBe(80);
      expect(getAntiguedadValue(19)).toBe(80);
    });

    it('10-14 años = 60', () => {
      expect(getAntiguedadValue(10)).toBe(60);
      expect(getAntiguedadValue(14)).toBe(60);
    });

    it('5-9 años = 40', () => {
      expect(getAntiguedadValue(5)).toBe(40);
      expect(getAntiguedadValue(9)).toBe(40);
    });

    it('1-4 años = 20', () => {
      expect(getAntiguedadValue(1)).toBe(20);
      expect(getAntiguedadValue(4)).toBe(20);
    });

    it('<1 año = 10', () => {
      expect(getAntiguedadValue(0)).toBe(10);
      expect(getAntiguedadValue(0.5)).toBe(10);
    });
  });

  describe('getDisponibilidadValue', () => {
    it('≥80% = 100', () => {
      expect(getDisponibilidadValue(80)).toBe(100);
      expect(getDisponibilidadValue(100)).toBe(100);
    });

    it('60-79% = 75', () => {
      expect(getDisponibilidadValue(60)).toBe(75);
      expect(getDisponibilidadValue(79)).toBe(75);
    });

    it('40-59% = 50', () => {
      expect(getDisponibilidadValue(40)).toBe(50);
      expect(getDisponibilidadValue(59)).toBe(50);
    });

    it('<40% = 25', () => {
      expect(getDisponibilidadValue(0)).toBe(25);
      expect(getDisponibilidadValue(39)).toBe(25);
    });
  });

  describe('getPreferenciaValue', () => {
    it('100% = 100', () => {
      expect(getPreferenciaValue(100)).toBe(100);
    });

    it('75-99% = 75', () => {
      expect(getPreferenciaValue(75)).toBe(75);
      expect(getPreferenciaValue(99)).toBe(75);
    });

    it('50-74% = 50', () => {
      expect(getPreferenciaValue(50)).toBe(50);
      expect(getPreferenciaValue(74)).toBe(50);
    });

    it('25-49% = 25', () => {
      expect(getPreferenciaValue(25)).toBe(25);
      expect(getPreferenciaValue(49)).toBe(25);
    });

    it('<25% = 10', () => {
      expect(getPreferenciaValue(0)).toBe(10);
      expect(getPreferenciaValue(24)).toBe(10);
    });
  });

  describe('getCargaValue', () => {
    it('0-25% = 100', () => {
      expect(getCargaValue(0)).toBe(100);
      expect(getCargaValue(25)).toBe(100);
    });

    it('26-50% = 75', () => {
      expect(getCargaValue(26)).toBe(75);
      expect(getCargaValue(50)).toBe(75);
    });

    it('51-75% = 50', () => {
      expect(getCargaValue(51)).toBe(50);
      expect(getCargaValue(75)).toBe(50);
    });

    it('76-90% = 25', () => {
      expect(getCargaValue(76)).toBe(25);
      expect(getCargaValue(90)).toBe(25);
    });

    it('>90% = 0', () => {
      expect(getCargaValue(91)).toBe(0);
      expect(getCargaValue(100)).toBe(0);
    });
  });

  describe('calculateDocenteScore', () => {
    it('matches the PLANNING.md example: Dr. Juan Pérez = 85.0', () => {
      // Principal(100) + Nombrado bonus(10) = 110 for categoría
      // But the PLANNING example uses Categoría=100 (Principal without bonus)
      // The example: (100×0.35) + (80×0.25) + (75×0.15) + (75×0.15) + (75×0.10) = 85.0
      // Our implementation adds Nombrado bonus, so let's use Contratado to match
      const input: DocenteScoreInput = {
        categoria: 'Principal',
        condicion: 'Contratado',
        aniosAntiguedad: 18, // → 80
        porcentajeDisponible: 72, // → 75
        porcentajePreferido: 85, // → 75
        porcentajeCarga: 35, // → 75
      };

      const score = calculateDocenteScore(input);
      expect(score).toBeCloseTo(85.0, 1);
    });

    it('calculates highest possible score', () => {
      const input: DocenteScoreInput = {
        categoria: 'Principal',
        condicion: 'Nombrado',
        aniosAntiguedad: 25,
        porcentajeDisponible: 90,
        porcentajePreferido: 100,
        porcentajeCarga: 0,
      };

      const score = calculateDocenteScore(input);
      // (110×0.35) + (100×0.25) + (100×0.15) + (100×0.15) + (100×0.10)
      // = 38.5 + 25 + 15 + 15 + 10 = 103.5
      expect(score).toBeCloseTo(103.5, 1);
    });

    it('calculates lowest possible score', () => {
      const input: DocenteScoreInput = {
        categoria: 'Auxiliar',
        condicion: 'Contratado',
        aniosAntiguedad: 0,
        porcentajeDisponible: 10,
        porcentajePreferido: 5,
        porcentajeCarga: 95,
      };

      const score = calculateDocenteScore(input);
      // (40×0.35) + (10×0.25) + (25×0.15) + (10×0.15) + (0×0.10)
      // = 14 + 2.5 + 3.75 + 1.5 + 0 = 21.75
      expect(score).toBeCloseTo(21.75, 1);
    });

    it('Nombrado scores higher than Contratado with same attributes', () => {
      const base: Omit<DocenteScoreInput, 'condicion'> = {
        categoria: 'Asociado',
        aniosAntiguedad: 10,
        porcentajeDisponible: 60,
        porcentajePreferido: 50,
        porcentajeCarga: 50,
      };

      const nombrado = calculateDocenteScore({ ...base, condicion: 'Nombrado' });
      const contratado = calculateDocenteScore({ ...base, condicion: 'Contratado' });

      expect(nombrado).toBeGreaterThan(contratado);
    });

    it('Principal scores higher than Auxiliar with same attributes', () => {
      const base: Omit<DocenteScoreInput, 'categoria'> = {
        condicion: 'Contratado',
        aniosAntiguedad: 5,
        porcentajeDisponible: 50,
        porcentajePreferido: 50,
        porcentajeCarga: 50,
      };

      const principal = calculateDocenteScore({ ...base, categoria: 'Principal' });
      const auxiliar = calculateDocenteScore({ ...base, categoria: 'Auxiliar' });

      expect(principal).toBeGreaterThan(auxiliar);
    });
  });
});
