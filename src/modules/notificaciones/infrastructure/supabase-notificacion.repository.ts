import { createClient } from '@/shared/lib/supabase/server';
import { INotificacionRepository } from '../domain/repositories/notificacion.repository';
import { Notificacion } from '../domain/entities/notificacion.entity';

export class SupabaseNotificacionRepository implements INotificacionRepository {
  async findAll(): Promise<Notificacion[]> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('destinatario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }

    return data.map(this.mapToEntity);
  }

  async save(
    notificacion: Omit<Notificacion, 'id' | 'createdAt' | 'leida'>
  ): Promise<Notificacion> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notificaciones')
      .insert({
        destinatario_id: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        leida: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async markAsRead(id: string): Promise<Notificacion> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al marcar notificación como leída: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async markAllAsRead(): Promise<void> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('destinatario_id', user.id);

    if (error) {
      throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Notificacion {
    return {
      id: data.id,
      destinatarioId: data.destinatario_id,
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      leida: data.leida,
      createdAt: data.created_at,
    };
  }
}
