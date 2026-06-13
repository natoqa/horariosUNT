import { INotificacionRepository } from '../../domain/repositories/notificacion.repository';
import { Notificacion } from '../../domain/entities/notificacion.entity';

export class CrearNotificacionUseCase {
  constructor(private readonly repository: INotificacionRepository) {}

  async execute(
    notificacion: Omit<Notificacion, 'id' | 'createdAt' | 'leida'>
  ): Promise<Notificacion> {
    return this.repository.save(notificacion);
  }
}
