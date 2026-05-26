import { IPeriodoRepository } from '../domain/repositories/periodo.repository';
import { Periodo, TipoCiclo } from '../domain/entities/periodo.entity';
import { EstadoPeriodo } from '@/shared/constants/period-states';
import { createClient } from '@/shared/lib/supabase/server';

interface PeriodoRow {
  id: string;
  name: string;
  tipo_ciclo: string;
  start_date: string;
  end_date: string;
  availability_deadline: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export class SupabasePeriodoRepository implements IPeriodoRepository {
  async findById(id: string): Promise<Periodo | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToPeriodo(data as PeriodoRow);
  }

  async findAll(): Promise<Periodo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as PeriodoRow[]).map(this.mapToPeriodo);
  }

  async findActive(): Promise<Periodo | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .neq('state', 'Cerrado')
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapToPeriodo(data as PeriodoRow);
  }

  async save(
    periodo: Omit<Periodo, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Periodo> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('periodos')
      .insert({
        name: periodo.name,
        tipo_ciclo: periodo.tipoCiclo,
        start_date: periodo.startDate,
        end_date: periodo.endDate,
        availability_deadline: periodo.availabilityDeadline,
        state: periodo.state,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al crear el período académico.');
    }
    return this.mapToPeriodo(data as PeriodoRow);
  }

  async update(
    id: string,
    updateData: Partial<Omit<Periodo, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Periodo> {
    const supabase = await createClient();

    const dbData: Record<string, unknown> = {};
    if (updateData.name !== undefined) dbData.name = updateData.name;
    if (updateData.tipoCiclo !== undefined) dbData.tipo_ciclo = updateData.tipoCiclo;
    if (updateData.startDate !== undefined)
      dbData.start_date = updateData.startDate;
    if (updateData.endDate !== undefined) dbData.end_date = updateData.endDate;
    if (updateData.availabilityDeadline !== undefined)
      dbData.availability_deadline = updateData.availabilityDeadline;
    if (updateData.state !== undefined) dbData.state = updateData.state;

    const { data, error } = await supabase
      .from('periodos')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Error al actualizar el período académico.');
    }
    return this.mapToPeriodo(data as PeriodoRow);
  }

  async updateState(id: string, state: EstadoPeriodo): Promise<Periodo> {
    return this.update(id, { state });
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('periodos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Error al eliminar el periodo.');
    }
  }

  private mapToPeriodo(row: PeriodoRow): Periodo {
    return {
      id: row.id,
      name: row.name,
      tipoCiclo: row.tipo_ciclo as TipoCiclo,
      startDate: row.start_date,
      endDate: row.end_date,
      availabilityDeadline: row.availability_deadline,
      state: row.state as EstadoPeriodo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
