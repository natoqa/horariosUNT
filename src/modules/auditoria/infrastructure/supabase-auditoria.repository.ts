import { IAuditoriaRepository } from '../domain/repositories/auditoria.repository';
import { AuditLog } from '../domain/entities/audit-log.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface AuditLogRow {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  modulo: string;
  accion: string;
  entidad_id?: string | null;
  datos_anteriores?: any;
  datos_nuevos?: any;
  descripcion?: string | null;
  created_at: string;
}

export class SupabaseAuditoriaRepository implements IAuditoriaRepository {
  async findAll(filters?: {
    userEmail?: string;
    modulo?: string;
    accion?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    const supabase = await createClient();
    let query = supabase
      .from('auditoria')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userEmail) {
      query = query.ilike('user_email', `%${filters.userEmail}%`);
    }
    if (filters?.modulo) {
      query = query.eq('modulo', filters.modulo);
    }
    if (filters?.accion) {
      query = query.eq('accion', filters.accion);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      // Para que incluya todo el día seleccionado, si el usuario solo pone fecha
      const end = filters.endDate.includes('T') ? filters.endDate : `${filters.endDate}T23:59:59.999Z`;
      query = query.lte('created_at', end);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as AuditLogRow[]).map(this.mapToEntity);
  }

  async save(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('auditoria')
      .insert({
        user_id: log.userId,
        user_email: log.userEmail,
        user_role: log.userRole,
        modulo: log.modulo,
        accion: log.accion,
        entidad_id: log.entidadId,
        datos_anteriores: log.datosAnteriores,
        datos_nuevos: log.datosNuevos,
        descripcion: log.descripcion,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al guardar log de auditoría.');
    }
    return this.mapToEntity(data as AuditLogRow);
  }

  private mapToEntity(row: AuditLogRow): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      userRole: row.user_role,
      modulo: row.modulo,
      accion: row.accion,
      entidadId: row.entidad_id,
      datosAnteriores: row.datos_anteriores,
      datosNuevos: row.datos_nuevos,
      descripcion: row.descripcion,
      createdAt: row.created_at,
    };
  }
}
