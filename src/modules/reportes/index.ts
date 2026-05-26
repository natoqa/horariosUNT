export type { ReportConfig, ReportFilterType, Ciclo } from './domain/entities/report-config.entity';
export { REPORT_FILTER_TYPES, CICLOS } from './domain/entities/report-config.entity';
export { ReportesContent } from './presentation/components/reportes-content';
export { generatePdfAction } from './presentation/actions/generate-pdf.action';
export { generateExcelAction } from './presentation/actions/generate-excel.action';
export { getCargaDocenteAction } from './presentation/actions/get-carga-docente.action';
export { generateCargaDocentePdfAction } from './presentation/actions/generate-carga-docente-pdf.action';
export { getOcupacionAulaAction } from './presentation/actions/get-ocupacion-aula.action';
export { generateOcupacionAulasPdfAction } from './presentation/actions/generate-ocupacion-aulas-pdf.action';
