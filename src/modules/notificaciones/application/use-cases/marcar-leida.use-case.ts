import { INotificacionRepository } from '../../domain/repositories/notificacion.repository';

export class MarcarLeidaUseCase {
  constructor(private readonly repository: INotificacionRepository) {}

  async execute(id?: string): Promise<void> {
    if (id) {
      await this.repository.markAsRead(id);
    } else {
      await this.repository.markAllAsRead();
    }
  }
}
