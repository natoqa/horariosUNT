export type { Periodo, TipoCiclo } from './domain/entities/periodo.entity';
export { canTransitionTo, getNextStates, getCiclosByTipo, CICLOS_IMPAR, CICLOS_PAR } from './domain/entities/periodo.entity';
export type { IPeriodoRepository } from './domain/repositories/periodo.repository';
export { PeriodoForm } from './presentation/components/periodo-form';
export { PeriodoTable } from './presentation/components/periodo-table';
export { PeriodoStatusBadge } from './presentation/components/periodo-status-badge';
export { PeriodosContent } from './presentation/components/periodos-content';
export { changeStateAction } from './presentation/actions/change-state.action';
