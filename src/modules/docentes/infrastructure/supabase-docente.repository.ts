import { IDocenteRepository, DocenteFilters } from '../domain/repositories/docente.repository';
import { Docente } from '../domain/entities/docente.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface DocenteRow {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string | null;
  categoria: string;
  regimen: string;
  condicion: string;
  escuela: string;
  fecha_ingreso: string;
  carga_maxima: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseDocenteRepository implements IDocenteRepository {
  async findById(id: string): Promise<Docente | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToDocente(data as DocenteRow);
  }

  async findAll(filters?: DocenteFilters): Promise<Docente[]> {
    const supabase = await createClient();
    let query = supabase.from('docentes').select('*');

    if (filters?.search) {
      query = query.or(
        `nombres.ilike.%${filters.search}%,apellidos.ilike.%${filters.search}%`,
      );
    }
    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }

    const { data, error } = await query.order('apellidos', { ascending: true });

    if (error || !data) return [];
    return (data as DocenteRow[]).map(this.mapToDocente);
  }

  async findByDni(dni: string): Promise<Docente | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .eq('dni', dni)
      .single();

    if (error || !data) return null;
    return this.mapToDocente(data as DocenteRow);
  }

  async findByCorreo(correo: string): Promise<Docente | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .eq('correo', correo)
      .single();

    if (error || !data) return null;
    return this.mapToDocente(data as DocenteRow);
  }

  async save(
    docente: Omit<Docente, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Docente> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('docentes')
      .insert({
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        dni: docente.dni,
        correo: docente.correo,
        telefono: docente.telefono,
        categoria: docente.categoria,
        regimen: docente.regimen,
        condicion: docente.condicion,
        escuela: docente.escuela,
        fecha_ingreso: docente.fechaIngreso,
        carga_maxima: docente.cargaMaxima,
        estado: docente.estado,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar el docente.');
    }
    return this.mapToDocente(data as DocenteRow);
  }

  async update(
    id: string,
    updateData: Partial<Omit<Docente, 'id' | 'dni' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Docente> {
    const supabase = await createClient();

    const dbData: Record<string, unknown> = {};
    if (updateData.nombres !== undefined) dbData.nombres = updateData.nombres;
    if (updateData.apellidos !== undefined) dbData.apellidos = updateData.apellidos;
    if (updateData.correo !== undefined) dbData.correo = updateData.correo;
    if (updateData.telefono !== undefined) dbData.telefono = updateData.telefono;
    if (updateData.categoria !== undefined) dbData.categoria = updateData.categoria;
    if (updateData.regimen !== undefined) dbData.regimen = updateData.regimen;
    if (updateData.condicion !== undefined) dbData.condicion = updateData.condicion;
    if (updateData.escuela !== undefined) dbData.escuela = updateData.escuela;
    if (updateData.fechaIngreso !== undefined) dbData.fecha_ingreso = updateData.fechaIngreso;
    if (updateData.cargaMaxima !== undefined) dbData.carga_maxima = updateData.cargaMaxima;
    if (updateData.estado !== undefined) dbData.estado = updateData.estado;

    const { data, error } = await supabase
      .from('docentes')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar el docente.');
    }
    return this.mapToDocente(data as DocenteRow);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('docentes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Error al eliminar el docente.');
    }
  }

  private mapToDocente(row: DocenteRow): Docente {
    return {
      id: row.id,
      nombres: row.nombres,
      apellidos: row.apellidos,
      dni: row.dni,
      correo: row.correo,
      telefono: row.telefono,
      categoria: row.categoria as Docente['categoria'],
      regimen: row.regimen as Docente['regimen'],
      condicion: row.condicion as Docente['condicion'],
      escuela: row.escuela as Docente['escuela'],
      fechaIngreso: row.fecha_ingreso,
      cargaMaxima: row.carga_maxima,
      cargaElectiva: 0,
      estado: row.estado as Docente['estado'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
