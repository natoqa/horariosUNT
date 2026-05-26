import { INotificacionRepository } from '../../domain/repositories/notificacion.repository';
import { Notificacion } from '../../domain/entities/notificacion.entity';

export class GetNotificacionesUseCase {
  constructor(private readonly repository: INotificacionRepository) {}

  async execute(): Promise<Notificacion[]> {
    return this.repository.findAll();
  }
}
