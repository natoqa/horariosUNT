import { IHorarioRepository } from '../domain/repositories/horario.repository';
import { Horario, Asignacion, GenerationSummary, HorarioEstado } from '../domain/entities/horario.entity';
import { GeneratedAssignment } from '../domain/services/schedule-generator.service';
import { createClient } from '@/shared/lib/supabase/server';

interface HorarioRow {
  id: string;
  periodo_id: string;
  estado: string;
  fecha_generacion: string;
  resumen?: any;
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
  tipo?: string;
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

  async save(periodoId: string, resumen?: GenerationSummary): Promise<Horario> {
    const supabase = await createClient();

    // Delete existing horarios for this periodo
    await supabase.from('horarios').delete().eq('periodo_id', periodoId);

    const estadoToSave = 'Borrador';
    console.log('[HorarioRepository] Guardando horario con estado:', estadoToSave);
    console.log('[HorarioRepository] Tipo de estado:', typeof estadoToSave);

    const insertData: any = {
      periodo_id: periodoId,
      estado: estadoToSave,
      fecha_generacion: new Date().toISOString(),
    };

    // Solo incluir resumen si existe y no es nulo
    if (resumen !== undefined && resumen !== null) {
      insertData.resumen = resumen;
    }

    const { data, error } = await supabase
      .from('horarios')
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      console.error('[HorarioRepository] Error al guardar horario:', error);
      // Si el error es por la columna resumen, intentar de nuevo sin ella
      if (error?.message?.includes('resumen')) {
        console.warn('[HorarioRepository] Intentando guardar sin columna resumen...');
        const { data: dataFallback, error: errorFallback } = await supabase
          .from('horarios')
          .insert({
            periodo_id: periodoId,
            estado: estadoToSave,
            fecha_generacion: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (errorFallback || !dataFallback) {
          throw new Error(errorFallback?.message || 'Error al guardar horario sin resumen.');
        }
        return this.mapToHorario(dataFallback as HorarioRow);
      }
      throw new Error(error?.message || 'Error al guardar horario.');
    }
    return this.mapToHorario(data as HorarioRow);
  }

  async saveAsignaciones(
    horarioId: string,
    asignaciones: GeneratedAssignment[],
  ): Promise<Asignacion[]> {
    const supabase = await createClient();

    console.log('[HorarioRepository] saveAsignaciones called with:', { horarioId, asignacionesCount: asignaciones.length, asignaciones });

    const TIPO_MAP: Record<string, string> = {
      'teorico': 'Teórica',
      'practico': 'Práctica',
    };

    // Primero intentamos con tipo
    let rowsWithTipo = asignaciones.map((a) => ({
      horario_id: horarioId,
      grupo_id: a.grupoId,
      docente_id: a.docenteId,
      aula_id: a.aulaId,
      dia: a.dia,
      bloque: a.bloque,
      tipo: TIPO_MAP[a.tipo] || a.tipo,
    }));
    console.log('[HorarioRepository] Rows to insert with tipo:', rowsWithTipo);

    let { data, error } = await supabase
      .from('asignaciones')
      .insert(rowsWithTipo)
      .select();

    console.log('[HorarioRepository] Insert result with tipo:', { data, error });

    // Si falla por la columna tipo, intentamos sin ella
    if (error && error?.message?.includes('tipo')) {
      console.warn('[HorarioRepository] Intentando guardar sin columna tipo...');
      const rowsWithoutTipo = asignaciones.map((a) => ({
        horario_id: horarioId,
        grupo_id: a.grupoId,
        docente_id: a.docenteId,
        aula_id: a.aulaId,
        dia: a.dia,
        bloque: a.bloque,
      }));

      const resultWithoutTipo = await supabase
        .from('asignaciones')
        .insert(rowsWithoutTipo)
        .select();

      console.log('[HorarioRepository] Insert result without tipo:', resultWithoutTipo);

      if (resultWithoutTipo.error || !resultWithoutTipo.data) {
        throw new Error(resultWithoutTipo.error?.message || 'Error al guardar asignaciones sin tipo.');
      }
      return (resultWithoutTipo.data as AsignacionRow[]).map(this.mapToAsignacion);
    }

    if (error || !data) {
      throw new Error(error?.message || 'Error al guardar asignaciones.');
    }
    const mapped = (data as AsignacionRow[]).map(this.mapToAsignacion);
    console.log('[HorarioRepository] Saved asignaciones:', mapped);
    return mapped;
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

  async updateEstado(id: string, estado: HorarioEstado): Promise<Horario> {
    const supabase = await createClient();
    // Mapear a mayúsculas para cumplir con el constraint de la base de datos
    const estadoMap: Record<string, string> = {
      'borrador': 'Borrador',
      'aprobado': 'Aprobado',
      'publicado': 'Publicado',
    };
    const estadoToSave = estadoMap[estado] || estado;

    const { data, error } = await supabase
      .from('horarios')
      .update({ estado: estadoToSave })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar estado del horario.');
    }
    return this.mapToHorario(data as HorarioRow);
  }

  private mapToHorario(row: HorarioRow): Horario {
    let resumenData: GenerationSummary | null = null;
    if (row.resumen) {
      // resumen is typically a parsed JSON object when returned by Supabase
      resumenData = typeof row.resumen === 'string'
        ? JSON.parse(row.resumen)
        : (row.resumen as GenerationSummary);
    }

    return {
      id: row.id,
      periodoId: row.periodo_id,
      estado: row.estado as Horario['estado'],
      fechaGeneracion: row.fecha_generacion,
      resumen: resumenData,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToAsignacion(row: AsignacionRow): Asignacion {
    const raw = (row.tipo ?? '').toLowerCase();
    const tipo: Asignacion['tipo'] = raw.startsWith('pr') ? 'practico' : 'teorico';
    return {
      id: row.id,
      horarioId: row.horario_id,
      grupoId: row.grupo_id,
      docenteId: row.docente_id,
      aulaId: row.aula_id,
      dia: row.dia as Asignacion['dia'],
      bloque: row.bloque as Asignacion['bloque'],
      tipo,
      createdAt: row.created_at,
    };
  }

  async saveManualAsignacion(
    horarioId: string,
    asignacion: GeneratedAssignment,
  ): Promise<Asignacion> {
    const supabase = await createClient();

    const row = {
      horario_id: horarioId,
      grupo_id: asignacion.grupoId,
      docente_id: asignacion.docenteId,
      aula_id: asignacion.aulaId,
      dia: asignacion.dia,
      bloque: asignacion.bloque,
      tipo: asignacion.tipo,
    };

    const { data, error } = await supabase
      .from('asignaciones')
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al guardar asignación manual.');
    }
    return this.mapToAsignacion(data as AsignacionRow);
  }

  async deleteAsignacion(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('asignaciones')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Error al eliminar asignación.');
    }
  }
}

