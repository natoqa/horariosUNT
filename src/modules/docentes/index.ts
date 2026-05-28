export type { Docente } from './domain/entities/docente.entity';
export { calcularAntiguedad, getCargaMaximaDefault } from './domain/entities/docente.entity';
export type { IDocenteRepository } from './domain/repositories/docente.repository';
export { DocentesCreateContent } from './presentation/components/docentes-create-content';
export { DocenteTable } from './presentation/components/docente-table';
export { DocenteForm } from './presentation/components/docente-form';
export { DocenteStatusBadge } from './presentation/components/docente-status-badge';
