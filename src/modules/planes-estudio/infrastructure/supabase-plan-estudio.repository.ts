import { createClient } from '@/shared/lib/supabase/client';
import { PlanEstudio } from '../domain/entities/plan-estudio.entity';
import { IPlanEstudioRepository } from '../domain/repositories/plan-estudio.repository';

export class SupabasePlanEstudioRepository implements IPlanEstudioRepository {
  async findAll(): Promise<PlanEstudio[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('planes_estudio')
      .select('*')
      .order('anio', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async findById(id: string): Promise<PlanEstudio | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('planes_estudio')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapToEntity(data);
  }

  async create(data: Omit<PlanEstudio, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanEstudio> {
    const supabase = createClient();
    const { data: dbData, error } = await supabase
      .from('planes_estudio')
      .insert({
        nombre: data.nombre,
        anio: data.anio,
        pdf_url: data.pdfUrl,
        estado: data.estado,
        fecha_publicacion: data.fechaPublicacion,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(dbData);
  }

  async update(id: string, data: Partial<Omit<PlanEstudio, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlanEstudio> {
    const supabase = createClient();
    const { data: dbData, error } = await supabase
      .from('planes_estudio')
      .update({
        nombre: data.nombre,
        anio: data.anio,
        pdf_url: data.pdfUrl,
        estado: data.estado,
        fecha_publicacion: data.fechaPublicacion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(dbData);
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('planes_estudio')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToEntity(data: any): PlanEstudio {
    return {
      id: data.id,
      nombre: data.nombre,
      anio: data.anio,
      pdfUrl: data.pdf_url,
      estado: data.estado,
      fechaPublicacion: data.fecha_publicacion,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
