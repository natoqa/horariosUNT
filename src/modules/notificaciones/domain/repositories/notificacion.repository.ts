import { Notificacion } from '../entities/notificacion.entity';

export interface INotificacionRepository {
  findAll(): Promise<Notificacion[]>;
  save(notificacion: Omit<Notificacion, 'id' | 'createdAt' | 'leida'>): Promise<Notificacion>;
  markAsRead(id: string): Promise<Notificacion>;
  markAllAsRead(): Promise<void>;
}
