export const REPORT_FILTER_TYPES = ['all', 'ciclo', 'docente', 'aula'] as const;
export type ReportFilterType = typeof REPORT_FILTER_TYPES[number];

export const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;
export type Ciclo = typeof CICLOS[number];

export interface ReportConfig {
  periodoId: string;
  filterType: ReportFilterType;
  filterId?: string;
  periodoName: string;
}
