import { IAulaRepository, AulaFilters } from '../domain/repositories/aula.repository';
import { Aula, AulaRestriccion } from '../domain/entities/aula.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface AulaRow {
  id: string;
  codigo: string;
  nombre: string;
  pabellon: string | null;
  piso: number | null;
  capacidad: number;
  tipo: string;
  equipamiento: string[];
  estado: string;
  created_at: string;
  updated_at: string;
}

interface AulaRestriccionRow {
  id: string;
  aula_id: string;
  dia: string;
  bloque: string;
  motivo: string | null;
  created_at: string;
}

export class SupabaseAulaRepository implements IAulaRepository {
  async findById(id: string): Promise<Aula | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('aulas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToAula(data as AulaRow);
  }

  async findAll(filters?: AulaFilters): Promise<Aula[]> {
    const supabase = await createClient();
    let query = supabase.from('aulas').select('*');

    if (filters?.search) {
      query = query.or(
        `nombre.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`,
      );
    }
    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters?.capacidadMin !== undefined) {
      query = query.gte('capacidad', filters.capacidadMin);
    }

    const { data, error } = await query.order('codigo', { ascending: true });

    if (error || !data) return [];
    return (data as AulaRow[]).map(this.mapToAula);
  }

  async findByCodigo(codigo: string): Promise<Aula | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('aulas')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !data) return null;
    return this.mapToAula(data as AulaRow);
  }

  async save(
    aula: Omit<Aula, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Aula> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('aulas')
      .insert({
        codigo: aula.codigo,
        nombre: aula.nombre,
        pabellon: aula.pabellon,
        piso: aula.piso,
        capacidad: aula.capacidad,
        tipo: aula.tipo,
        equipamiento: aula.equipamiento,
        estado: aula.estado,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar el aula.');
    }
    return this.mapToAula(data as AulaRow);
  }

  async update(
    id: string,
    updateData: Partial<Omit<Aula, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Aula> {
    const supabase = await createClient();

    const dbData: Record<string, unknown> = {};
    if (updateData.nombre !== undefined) dbData.nombre = updateData.nombre;
    if (updateData.pabellon !== undefined) dbData.pabellon = updateData.pabellon;
    if (updateData.piso !== undefined) dbData.piso = updateData.piso;
    if (updateData.capacidad !== undefined) dbData.capacidad = updateData.capacidad;
    if (updateData.tipo !== undefined) dbData.tipo = updateData.tipo;
    if (updateData.equipamiento !== undefined) dbData.equipamiento = updateData.equipamiento;
    if (updateData.estado !== undefined) dbData.estado = updateData.estado;

    const { data, error } = await supabase
      .from('aulas')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar el aula.');
    }
    return this.mapToAula(data as AulaRow);
  }

  // Métodos para AulaRestriccion
  async findRestriccionesByAula(aulaId: string): Promise<AulaRestriccion[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('aula_restricciones')
      .select('*')
      .eq('aula_id', aulaId);

    if (error || !data) return [];
    return (data as AulaRestriccionRow[]).map(this.mapToRestriccion);
  }

  async saveRestricciones(
    aulaId: string,
    restricciones: Omit<AulaRestriccion, 'id' | 'createdAt'>[],
  ): Promise<void> {
    const supabase = await createClient();
    const rows = restricciones.map((r) => ({
      aula_id: aulaId,
      dia: r.dia,
      bloque: r.bloque,
      motivo: r.motivo,
    }));

    const { error } = await supabase
      .from('aula_restricciones')
      .insert(rows);

    if (error) {
      throw new Error(error.message || 'Error al registrar restricciones de aula.');
    }
  }

  async clearRestricciones(aulaId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('aula_restricciones')
      .delete()
      .eq('aula_id', aulaId);

    if (error) {
      throw new Error(error.message || 'Error al limpiar restricciones de aula.');
    }
  }

  private mapToAula(row: AulaRow): Aula {
    return {
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      pabellon: row.pabellon,
      piso: row.piso,
      capacidad: row.capacidad,
      tipo: row.tipo as Aula['tipo'],
      equipamiento: row.equipamiento || [],
      estado: row.estado as Aula['estado'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToRestriccion(row: AulaRestriccionRow): AulaRestriccion {
    return {
      id: row.id,
      aulaId: row.aula_id,
      dia: row.dia as AulaRestriccion['dia'],
      bloque: row.bloque as AulaRestriccion['bloque'],
      motivo: row.motivo,
      createdAt: row.created_at,
    };
  }
}
