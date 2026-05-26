import { IHorarioRepository } from '../domain/repositories/horario.repository';
import { Horario, Asignacion, GenerationSummary } from '../domain/entities/horario.entity';
import { GeneratedAssignment } from '../domain/services/schedule-generator.service';
import { createClient } from '@/shared/lib/supabase/server';

interface HorarioRow {
  id: string;
  periodo_id: string;
  estado: string;
  fecha_generacion: string;
  resumen: string | null;
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
        estado: 'borrador',
        fecha_generacion: new Date().toISOString(),
        resumen: JSON.stringify(resumen),
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

  private mapToHorario(row: HorarioRow): Horario {
    let resumen: GenerationSummary | null = null;
    if (row.resumen) {
      try {
        resumen = JSON.parse(row.resumen) as GenerationSummary;
      } catch {
        resumen = null;
      }
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
