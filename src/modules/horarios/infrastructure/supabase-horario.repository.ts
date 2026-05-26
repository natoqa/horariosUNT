import { IHorarioRepository } from '../domain/repositories/horario.repository';
import { Horario, Asignacion, GenerationSummary } from '../domain/entities/horario.entity';
import { GeneratedAssignment } from '../domain/services/schedule-generator.service';
import { createClient } from '@/shared/lib/supabase/server';

interface HorarioRow {
  id: string;
  periodo_id: string;
  estado: string;
  fecha_generacion: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface AsignacionRow {
  id: string;
  horario_id: string;
  grupo_id: string;
  docente_id: string;
  aula_id: string;
  dia: string;
  bloque: string;
  tipo: string;
  created_at: string;
}

export class SupabaseHorarioRepository implements IHorarioRepository {
  async findByPeriodo(periodoId: string): Promise<Horario | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('periodo_id', periodoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapToHorario(data as HorarioRow);
  }

  async findById(id: string): Promise<Horario | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToHorario(data as HorarioRow);
  }

  async save(periodoId: string, resumen: GenerationSummary): Promise<Horario> {
    const supabase = await createClient();

    // Delete existing horarios for this periodo
    await supabase.from('horarios').delete().eq('periodo_id', periodoId);

    const { data, error } = await supabase
      .from('horarios')
      .insert({
        periodo_id: periodoId,
        estado: 'Borrador',
        fecha_generacion: new Date().toISOString(),
        metadata: resumen,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al guardar horario.');
    }
    return this.mapToHorario(data as HorarioRow);
  }

  async saveAsignaciones(
    horarioId: string,
    asignaciones: GeneratedAssignment[],
  ): Promise<Asignacion[]> {
    const supabase = await createClient();

    const rows = asignaciones.map((a) => ({
      horario_id: horarioId,
      grupo_id: a.grupoId,
      docente_id: a.docenteId,
      aula_id: a.aulaId,
      dia: a.dia,
      bloque: a.bloque,
      tipo: a.tipo,
    }));

    const { data, error } = await supabase
      .from('asignaciones')
      .insert(rows)
      .select();

    if (error || !data) {
      throw new Error(error?.message || 'Error al guardar asignaciones.');
    }
    return (data as AsignacionRow[]).map(this.mapToAsignacion);
  }

  async deleteAsignacionesByHorario(horarioId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('asignaciones')
      .delete()
      .eq('horario_id', horarioId);

    if (error) {
      throw new Error(error.message || 'Error al eliminar asignaciones.');
    }
  }

  async findAsignacionesByHorario(horarioId: string): Promise<Asignacion[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asignaciones')
      .select('*')
      .eq('horario_id', horarioId);

    if (error || !data) return [];
    return (data as AsignacionRow[]).map(this.mapToAsignacion);
  }

  async findAsignacionById(id: string): Promise<Asignacion | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asignaciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToAsignacion(data as AsignacionRow);
  }

  async updateAsignacion(
    id: string,
    updateData: Partial<Pick<Asignacion, 'docenteId' | 'aulaId' | 'dia' | 'bloque'>>,
  ): Promise<Asignacion> {
    const supabase = await createClient();

    const dbData: Record<string, unknown> = {};
    if (updateData.docenteId !== undefined) dbData.docente_id = updateData.docenteId;
    if (updateData.aulaId !== undefined) dbData.aula_id = updateData.aulaId;
    if (updateData.dia !== undefined) dbData.dia = updateData.dia;
    if (updateData.bloque !== undefined) dbData.bloque = updateData.bloque;

    const { data, error } = await supabase
      .from('asignaciones')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar la asignación.');
    }
    return this.mapToAsignacion(data as AsignacionRow);
  }

  async updateEstado(id: string, estado: string): Promise<Horario> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('horarios')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar estado del horario.');
    }
    return this.mapToHorario(data as HorarioRow);
  }

  private mapToHorario(row: HorarioRow): Horario {
    let resumen: GenerationSummary | null = null;
    if (row.metadata) {
      // metadata is typically a parsed JSON object when returned by Supabase
      resumen = typeof row.metadata === 'string' 
        ? JSON.parse(row.metadata) 
        : (row.metadata as GenerationSummary);
    }

    return {
      id: row.id,
      periodoId: row.periodo_id,
      estado: row.estado as Horario['estado'],
      fechaGeneracion: row.fecha_generacion,
      resumen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToAsignacion(row: AsignacionRow): Asignacion {
    return {
      id: row.id,
      horarioId: row.horario_id,
      grupoId: row.grupo_id,
      docenteId: row.docente_id,
      aulaId: row.aula_id,
      dia: row.dia as Asignacion['dia'],
      bloque: row.bloque as Asignacion['bloque'],
      tipo: row.tipo as Asignacion['tipo'],
      createdAt: row.created_at,
    };
  }
}
