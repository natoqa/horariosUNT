import { ICursoRepository, CursoFilters } from '../domain/repositories/curso.repository';
import { Curso } from '../domain/entities/curso.entity';
import { Grupo } from '../domain/entities/grupo.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface CursoRow {
  id: string;
  codigo: string;
  nombre: string;
  ciclo: string;
  tipo: string;
  horas_teoricas: number;
  horas_practicas: number;
  creditos: number;
  requiere_laboratorio: boolean;
  tipo_laboratorio: string | null;
  estado: string;
  plan_estudio_id: string | null;
  created_at: string;
  updated_at: string;
}

interface GrupoRow {
  id: string;
  curso_id: string;
  periodo_id: string;
  docente_id: string | null;
  nombre: string;
  num_estudiantes: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseCursoRepository implements ICursoRepository {
  async findById(id: string): Promise<Curso | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToCurso(data as CursoRow);
  }

  async findAll(filters?: CursoFilters): Promise<Curso[]> {
    const supabase = await createClient();
    let query = supabase.from('cursos').select(`
      *,
      planes_estudio!inner(estado)
    `);

    if (filters?.search) {
      query = query.or(
        `nombre.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`,
      );
    }
    if (filters?.ciclo) {
      query = query.eq('ciclo', filters.ciclo);
    }
    if (filters?.tipoCiclo) {
      if (filters.tipoCiclo === 'Impar') {
        query = query.in('ciclo', ['I', 'III', 'V', 'VII', 'IX']);
      } else if (filters.tipoCiclo === 'Par') {
        query = query.in('ciclo', ['II', 'IV', 'VI', 'VIII', 'X']);
      }
    }
    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters?.planEstudioId) {
      query = query.eq('plan_estudio_id', filters.planEstudioId);
    }

    // Filtrar solo cursos de planes activos
    query = query.filter('planes_estudio.estado', 'eq', 'Activo');

    // Ordenar de manera natural: primero por ciclo (I, II, III... pero como son strings, ordenamos de alguna forma o simplemente por ciclo y nombre)
    // El ciclo en DB es VARCHAR: 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
    // Como ordenamiento alfabético de números romanos no es ideal, los recuperamos y los ordenaremos si es necesario, o por código:
    const { data, error } = await query.order('codigo', { ascending: true });

    console.log('Supabase findAll - Cursos devueltos:', data?.length);
    console.log('Supabase findAll - Error:', error);

    if (error || !data) return [];
    return (data as CursoRow[]).map(this.mapToCurso);
  }

  async findByCodigo(codigo: string): Promise<Curso | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !data) return null;
    return this.mapToCurso(data as CursoRow);
  }

  async save(
    curso: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Curso> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cursos')
      .insert({
        codigo: curso.codigo,
        nombre: curso.nombre,
        ciclo: curso.ciclo,
        tipo: curso.tipo,
        horas_teoricas: curso.horasTeoricas,
        horas_practicas: curso.horasPracticas,
        creditos: curso.creditos,
        requiere_laboratorio: curso.requiereLaboratorio,
        tipo_laboratorio: curso.tipoLaboratorio,
        estado: curso.estado,
        plan_estudio_id: curso.planEstudioId,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar el curso.');
    }
    return this.mapToCurso(data as CursoRow);
  }

  async saveBatch(
    cursos: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Curso[]> {
    const supabase = await createClient();
    
    const cursosData = cursos.map(curso => ({
      codigo: curso.codigo,
      nombre: curso.nombre,
      ciclo: curso.ciclo,
      tipo: curso.tipo,
      horas_teoricas: curso.horasTeoricas,
      horas_practicas: curso.horasPracticas,
      creditos: curso.creditos,
      requiere_laboratorio: curso.requiereLaboratorio,
      tipo_laboratorio: curso.tipoLaboratorio,
      estado: curso.estado,
      plan_estudio_id: curso.planEstudioId,
    }));

    const { data, error } = await supabase
      .from('cursos')
      .insert(cursosData)
      .select();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar los cursos.');
    }
    return (data as CursoRow[]).map(this.mapToCurso);
  }

  async update(
    id: string,
    updateData: Partial<Omit<Curso, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Curso> {
    const supabase = await createClient();

    const dbData: Record<string, unknown> = {};
    if (updateData.nombre !== undefined) dbData.nombre = updateData.nombre;
    if (updateData.ciclo !== undefined) dbData.ciclo = updateData.ciclo;
    if (updateData.tipo !== undefined) dbData.tipo = updateData.tipo;
    if (updateData.horasTeoricas !== undefined) dbData.horas_teoricas = updateData.horasTeoricas;
    if (updateData.horasPracticas !== undefined) dbData.horas_practicas = updateData.horasPracticas;
    if (updateData.creditos !== undefined) dbData.creditos = updateData.creditos;
    if (updateData.requiereLaboratorio !== undefined) dbData.requiere_laboratorio = updateData.requiereLaboratorio;
    if (updateData.tipoLaboratorio !== undefined) dbData.tipo_laboratorio = updateData.tipoLaboratorio;
    if (updateData.estado !== undefined) dbData.estado = updateData.estado;
    if (updateData.planEstudioId !== undefined) dbData.plan_estudio_id = updateData.planEstudioId;

    const { data, error } = await supabase
      .from('cursos')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar el curso.');
    }
    return this.mapToCurso(data as CursoRow);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    console.log('Supabase delete - Intentando eliminar curso con ID:', id);
    const { error } = await supabase
      .from('cursos')
      .delete()
      .eq('id', id);

    console.log('Supabase delete - Error:', error);

    if (error) {
      throw new Error(error.message || 'Error al eliminar el curso.');
    }
  }

  // Métodos para Grupos (secciones)
  async findGruposByPeriodo(periodoId: string): Promise<Grupo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .eq('periodo_id', periodoId);

    if (error || !data) return [];
    return (data as GrupoRow[]).map(this.mapToGrupo);
  }

  async findGruposByCursoAndPeriodo(cursoId: string, periodoId: string): Promise<Grupo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .eq('curso_id', cursoId)
      .eq('periodo_id', periodoId)
      .order('nombre', { ascending: true });

    if (error || !data) return [];
    return (data as GrupoRow[]).map(this.mapToGrupo);
  }

  async saveGrupo(
    grupo: Omit<Grupo, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Grupo> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('grupos')
      .insert({
        curso_id: grupo.cursoId,
        periodo_id: grupo.periodoId,
        docente_id: grupo.docenteId,
        nombre: grupo.nombre,
        num_estudiantes: grupo.numEstudiantes,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar el grupo.');
    }
    return this.mapToGrupo(data as GrupoRow);
  }

  async deleteGrupo(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Error al eliminar el grupo.');
    }
  }

  private mapToCurso(row: CursoRow): Curso {
    return {
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      ciclo: row.ciclo as Curso['ciclo'],
      tipo: row.tipo as Curso['tipo'],
      horasTeoricas: row.horas_teoricas,
      horasPracticas: row.horas_practicas,
      creditos: row.creditos,
      requiereLaboratorio: row.requiere_laboratorio,
      tipoLaboratorio: row.tipo_laboratorio,
      estado: row.estado as Curso['estado'],
      planEstudioId: row.plan_estudio_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToGrupo(row: GrupoRow): Grupo {
    return {
      id: row.id,
      cursoId: row.curso_id,
      periodoId: row.periodo_id,
      docenteId: row.docente_id,
      nombre: row.nombre,
      numEstudiantes: row.num_estudiantes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
