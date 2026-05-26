export type { Periodo } from './domain/entities/periodo.entity';
export { canTransitionTo, getNextStates } from './domain/entities/periodo.entity';
export type { IPeriodoRepository } from './domain/repositories/periodo.repository';
export { PeriodoForm } from './presentation/components/periodo-form';
export { PeriodoTable } from './presentation/components/periodo-table';
export { PeriodoStatusBadge } from './presentation/components/periodo-status-badge';
export { PeriodosContent } from './presentation/components/periodos-content';
