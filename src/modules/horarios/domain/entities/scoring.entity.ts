import { CategoriaDocente, CondicionDocente } from '@/shared/constants/categories';

export const SCORING_WEIGHTS = {
  categoria: 0.35,
  antiguedad: 0.25,
  disponibilidad: 0.15,
  preferencia: 0.15,
  carga: 0.10,
} as const;

const CATEGORIA_VALUES: Record<CategoriaDocente, number> = {
  Principal: 100,
  Asociado: 70,
  Auxiliar: 40,
};

const CONDICION_BONUS: Record<CondicionDocente, number> = {
  Nombrado: 10,
  Contratado: 0,
};

export function getCategoriaValue(categoria: CategoriaDocente, condicion: CondicionDocente): number {
  return CATEGORIA_VALUES[categoria] + CONDICION_BONUS[condicion];
}

export function getAntiguedadValue(aniosAntiguedad: number): number {
  if (aniosAntiguedad >= 20) return 100;
  if (aniosAntiguedad >= 15) return 80;
  if (aniosAntiguedad >= 10) return 60;
  if (aniosAntiguedad >= 5) return 40;
  if (aniosAntiguedad >= 1) return 20;
  return 10;
}

export function getDisponibilidadValue(porcentajeDisponible: number): number {
  if (porcentajeDisponible >= 80) return 100;
  if (porcentajeDisponible >= 60) return 75;
  if (porcentajeDisponible >= 40) return 50;
  return 25;
}

export function getPreferenciaValue(porcentajePreferido: number): number {
  if (porcentajePreferido >= 100) return 100;
  if (porcentajePreferido >= 75) return 75;
  if (porcentajePreferido >= 50) return 50;
  if (porcentajePreferido >= 25) return 25;
  return 10;
}

export function getCargaValue(porcentajeCarga: number): number {
  if (porcentajeCarga <= 25) return 100;
  if (porcentajeCarga <= 50) return 75;
  if (porcentajeCarga <= 75) return 50;
  if (porcentajeCarga <= 90) return 25;
  return 0;
}

export interface DocenteScoreInput {
  categoria: CategoriaDocente;
  condicion: CondicionDocente;
  aniosAntiguedad: number;
  porcentajeDisponible: number;
  porcentajePreferido: number;
  porcentajeCarga: number;
}

export function calculateDocenteScore(input: DocenteScoreInput): number {
  const c = getCategoriaValue(input.categoria, input.condicion);
  const a = getAntiguedadValue(input.aniosAntiguedad);
  const d = getDisponibilidadValue(input.porcentajeDisponible);
  const p = getPreferenciaValue(input.porcentajePreferido);
  const l = getCargaValue(input.porcentajeCarga);

  return (
    c * SCORING_WEIGHTS.categoria +
    a * SCORING_WEIGHTS.antiguedad +
    d * SCORING_WEIGHTS.disponibilidad +
    p * SCORING_WEIGHTS.preferencia +
    l * SCORING_WEIGHTS.carga
  );
}
