export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

export const BLOQUES_HORARIOS = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00'
] as const;

export type DiaSemana = typeof DIAS_SEMANA[number];
export type BloqueHorario = typeof BLOQUES_HORARIOS[number];
