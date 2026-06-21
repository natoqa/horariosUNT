import { createClient as createClientClient } from '@/shared/lib/supabase/client';
import { createClient as createServerClient } from '@/shared/lib/supabase/server';
import { PlanEstudio } from '../domain/entities/plan-estudio.entity';
import { IPlanEstudioRepository } from '../domain/repositories/plan-estudio.repository';

export class SupabasePlanEstudioRepository implements IPlanEstudioRepository {
  async findAll(): Promise<PlanEstudio[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('planes_estudio')
      .select('*')
      .order('anio', { ascending: false });

    console.log('Datos de planes_estudio de Supabase:', data);
    console.log('Error de Supabase:', error);

    if (error) throw error;

    // Para cada plan, contar cursos y docentes
    const planesWithCounts = await Promise.all(
      data.map(async (row: any) => {
        // Contar cursos del plan
        const { count: cursosCount, error: cursosError } = await supabase
          .from('cursos')
          .select('*', { count: 'exact', head: true })
          .eq('plan_estudio_id', row.id);

        console.log(`Plan ${row.id} - cursosCount query result:`, cursosCount, cursosError);

        // Obtener docentes únicos de los grupos de los cursos del plan
        const { data: cursosData } = await supabase
          .from('cursos')
          .select('id')
          .eq('plan_estudio_id', row.id);

        console.log(`Plan ${row.id} - cursosData length:`, cursosData?.length || 0);

        const docentesIds = new Set<string>();
        if (cursosData && cursosData.length > 0) {
          const cursoIds = cursosData.map((c: any) => c.id);
          const { data: gruposData } = await supabase
            .from('grupos')
            .select('docente_id')
            .in('curso_id', cursoIds);
          
          if (gruposData) {
            gruposData.forEach((g: any) => {
              if (g.docente_id) {
                docentesIds.add(g.docente_id);
              }
            });
          }
        }

        console.log(`Plan ${row.id} - cursosCount: ${cursosCount}, docentesCount: ${docentesIds.size}`);

        return {
          ...this.mapToEntity(row),
          cursosCount: cursosCount || 0,
          docentesCount: docentesIds.size || 0
        };
      })
    );

    return planesWithCounts;
  }

  async findById(id: string): Promise<PlanEstudio | null> {
    const supabase = await createClientClient();
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
    const supabase = await createServerClient();
    
    console.log('Intentando guardar plan en Supabase:', data);
    
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

    console.log('Resultado de insert:', dbData);
    console.log('Error de insert:', error);

    if (error) throw error;
    return this.mapToEntity(dbData);
  }

  async update(id: string, data: Partial<Omit<PlanEstudio, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlanEstudio> {
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
