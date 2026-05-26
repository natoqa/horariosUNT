import { describe, it, expect } from 'vitest';
import { canTransitionTo, getNextStates } from './periodo.entity';
import { EstadoPeriodo } from '@/shared/constants/period-states';

describe('Periodo Entity — Máquina de Estados', () => {
  describe('canTransitionTo', () => {
    // RN-022: Transiciones válidas secuenciales
    it('permite Configuración → Recopilación', () => {
      expect(canTransitionTo('Configuración', 'Recopilación')).toBe(true);
    });

    it('permite Recopilación → Generación', () => {
      expect(canTransitionTo('Recopilación', 'Generación')).toBe(true);
    });

    it('permite Generación → Aprobado', () => {
      expect(canTransitionTo('Generación', 'Aprobado')).toBe(true);
    });

    it('permite Aprobado → Publicado', () => {
      expect(canTransitionTo('Aprobado', 'Publicado')).toBe(true);
    });

    it('permite Publicado → Cerrado', () => {
      expect(canTransitionTo('Publicado', 'Cerrado')).toBe(true);
    });

    // RN-022: Excepción — retroceso de Generación a Recopilación
    it('permite Generación → Recopilación (excepción RN-022)', () => {
      expect(canTransitionTo('Generación', 'Recopilación')).toBe(true);
    });

    // RN-022: Transiciones inválidas — no se puede retroceder
    it('rechaza Recopilación → Configuración', () => {
      expect(canTransitionTo('Recopilación', 'Configuración')).toBe(false);
    });

    it('rechaza Aprobado → Generación', () => {
      expect(canTransitionTo('Aprobado', 'Generación')).toBe(false);
    });

    it('rechaza Publicado → Aprobado', () => {
      expect(canTransitionTo('Publicado', 'Aprobado')).toBe(false);
    });

    it('rechaza Cerrado → cualquier estado', () => {
      const estados: EstadoPeriodo[] = [
        'Configuración',
        'Recopilación',
        'Generación',
        'Aprobado',
        'Publicado',
        'Cerrado',
      ];
      for (const estado of estados) {
        expect(canTransitionTo('Cerrado', estado)).toBe(false);
      }
    });

    // Transiciones inválidas — saltos no permitidos
    it('rechaza Configuración → Generación (salto)', () => {
      expect(canTransitionTo('Configuración', 'Generación')).toBe(false);
    });

    it('rechaza Configuración → Aprobado (salto)', () => {
      expect(canTransitionTo('Configuración', 'Aprobado')).toBe(false);
    });

    it('rechaza Recopilación → Aprobado (salto)', () => {
      expect(canTransitionTo('Recopilación', 'Aprobado')).toBe(false);
    });

    it('rechaza transición a sí mismo', () => {
      expect(canTransitionTo('Configuración', 'Configuración')).toBe(false);
      expect(canTransitionTo('Recopilación', 'Recopilación')).toBe(false);
      expect(canTransitionTo('Generación', 'Generación')).toBe(false);
    });
  });

  describe('getNextStates', () => {
    it('retorna [Recopilación] para Configuración', () => {
      expect(getNextStates('Configuración')).toEqual(['Recopilación']);
    });

    it('retorna [Generación] para Recopilación', () => {
      expect(getNextStates('Recopilación')).toEqual(['Generación']);
    });

    it('retorna [Recopilación, Aprobado] para Generación', () => {
      expect(getNextStates('Generación')).toEqual([
        'Recopilación',
        'Aprobado',
      ]);
    });

    it('retorna [Publicado] para Aprobado', () => {
      expect(getNextStates('Aprobado')).toEqual(['Publicado']);
    });

    it('retorna [Cerrado] para Publicado', () => {
      expect(getNextStates('Publicado')).toEqual(['Cerrado']);
    });

    it('retorna [] para Cerrado (estado terminal)', () => {
      expect(getNextStates('Cerrado')).toEqual([]);
    });
  });
});
