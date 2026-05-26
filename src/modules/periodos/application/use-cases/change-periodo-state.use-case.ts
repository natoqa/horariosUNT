import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { ChangeStateDTO, changeStateSchema } from '../dtos/change-state.dto';
import { Periodo, canTransitionTo } from '../../domain/entities/periodo.entity';

export class ChangePeriodoStateUseCase {
  constructor(private readonly periodoRepository: IPeriodoRepository) {}

  async execute(dto: ChangeStateDTO): Promise<Periodo> {
    const validated = changeStateSchema.parse(dto);

    const periodo = await this.periodoRepository.findById(validated.periodoId);
    if (!periodo) {
      throw new Error('Período no encontrado.');
    }

    if (!canTransitionTo(periodo.state, validated.newState)) {
      throw new Error(
        `No se puede cambiar de "${periodo.state}" a "${validated.newState}". Transición no permitida.`,
      );
    }

    return this.periodoRepository.updateState(
      validated.periodoId,
      validated.newState,
    );
  }
}
