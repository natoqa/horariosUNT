import { IDisponibilidadRepository, DisponibilidadBlock } from '../domain/repositories/disponibilidad.repository';
import { Disponibilidad } from '../domain/entities/disponibilidad.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface DisponibilidadRow {
  id: string;
  docente_id: string;
  periodo_id: string;
  dia: string;
  bloque: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseDisponibilidadRepository implements IDisponibilidadRepository {
  async findByDocenteAndPeriodo(docenteId: string, periodoId: string): Promise<Disponibilidad[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('disponibilidad')
      .select('*')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodoId);

    if (error || !data) return [];
    return (data as DisponibilidadRow[]).map(this.mapToEntity);
  }

  async saveBulk(
    docenteId: string,
    periodoId: string,
    blocks: DisponibilidadBlock[],
  ): Promise<Disponibilidad[]> {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from('disponibilidad')
      .delete()
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodoId);

    if (deleteError) {
      throw new Error(deleteError.message || 'Error al limpiar disponibilidad anterior.');
    }

    if (blocks.length === 0) return [];

    const rows = blocks.map((b) => ({
      docente_id: docenteId,
      periodo_id: periodoId,
      dia: b.dia,
      bloque: b.bloque,
      estado: b.estado,
    }));

    const { data, error: insertError } = await supabase
      .from('disponibilidad')
      .insert(rows)
      .select();

    if (insertError || !data) {
      throw new Error(insertError?.message || 'Error al guardar disponibilidad.');
    }

    return (data as DisponibilidadRow[]).map(this.mapToEntity);
  }

  private mapToEntity(row: DisponibilidadRow): Disponibilidad {
    return {
      id: row.id,
      docenteId: row.docente_id,
      periodoId: row.periodo_id,
      dia: row.dia as Disponibilidad['dia'],
      bloque: row.bloque as Disponibilidad['bloque'],
      estado: row.estado as Disponibilidad['estado'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
