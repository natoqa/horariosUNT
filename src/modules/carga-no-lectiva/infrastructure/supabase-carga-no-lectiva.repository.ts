import { createClient } from '@/shared/lib/supabase/server';
import {
  ActividadNoLectiva,
  ActividadNoLectivaTipo,
  CargaNoLectiva,
  CargaNoLectivaWithDocente,
} from '../domain/entities/carga-no-lectiva.entity';
import { ICargaNoLectivaRepository, ActividadNoLectivaInput } from '../domain/repositories/carga-no-lectiva.repository';

interface ActividadRow {
  id: string;
  docente_id: string;
  periodo_id: string;
  tipo: string;
  horas: number;
  detalles: string;
  dia?: string;
  bloque?: string;
  created_at: string;
  updated_at: string;
}

interface CargaRow {
  id: string;
  docente_id: string;
  periodo_id: string;
  horas_lectivas_asignadas: number;
  horas_lectivas_no_asignadas: number;
  lectiva_declarada: boolean;
  declaracion_lectiva: string;
  total_horas: number;
  estado: string;
  director_aprobado: boolean;
  secretaria_aprobado: boolean;
  created_at: string;
  updated_at: string;
  docente_nombres?: string;
  docente_apellidos?: string;
  docente_correo?: string;
}

export class SupabaseCargaNoLectivaRepository implements ICargaNoLectivaRepository {
  async findActividadesByDocentePeriodo(docenteId: string, periodoId: string): Promise<ActividadNoLectiva[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('actividades_no_lectivas')
      .select('*')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodoId)
      .order('tipo', { ascending: true });

    if (error || !data) return [];
    return (data as ActividadRow[]).map(this.mapActividad.bind(this));
  }

  async saveActividades(docenteId: string, periodoId: string, actividades: ActividadNoLectivaInput[]): Promise<ActividadNoLectiva[]> {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from('actividades_no_lectivas')
      .delete()
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodoId);

    if (deleteError) {
      throw new Error(deleteError.message || 'Error al limpiar actividades anteriores.');
    }

    const rows = actividades.map((actividad) => ({
      docente_id: docenteId,
      periodo_id: periodoId,
      tipo: actividad.tipo,
      horas: actividad.horas,
      detalles: actividad.detalles,
    }));

    const { data, error: insertError } = await supabase
      .from('actividades_no_lectivas')
      .insert(rows)
      .select();

    if (insertError || !data) {
      throw new Error(insertError?.message || 'Error al guardar actividades no lectivas.');
    }

    return (data as ActividadRow[]).map(this.mapActividad.bind(this));
  }

  async findCargaTotalByDocentePeriodo(docenteId: string, periodoId: string): Promise<CargaNoLectiva | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cargas_no_lectivas')
      .select('*')
      .eq('docente_id', docenteId)
      .eq('periodo_id', periodoId)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapCarga(data as CargaRow);
  }

  async saveCargaTotal(docenteId: string, periodoId: string, totalHoras: number): Promise<CargaNoLectiva> {
    const supabase = await createClient();
    const existing = await this.findCargaTotalByDocentePeriodo(docenteId, periodoId);

    if (existing) {
      const sameTotal = totalHoras === existing.totalHoras;
      const updatedEstado = existing.directorAprobado && existing.secretariaAprobado && sameTotal ? 'Aprobado' : 'En revisión';
      const { data, error } = await supabase
        .from('cargas_no_lectivas')
        .update({
          total_horas: totalHoras,
          estado: updatedEstado,
          director_aprobado: sameTotal ? existing.directorAprobado : false,
          secretaria_aprobado: sameTotal ? existing.secretariaAprobado : false,
        })
        .eq('id', existing.id)
        .select();

      if (error || !data || data.length === 0) {
        throw new Error(error ? `Error al actualizar: ${error.message}` : 'No se encontró la carga para actualizar.');
      }

      return this.mapCarga(data[0] as CargaRow);
    }

    const { data, error } = await supabase
      .from('cargas_no_lectivas')
      .insert({
        docente_id: docenteId,
        periodo_id: periodoId,
        total_horas: totalHoras,
        estado: 'En revisión',
      })
      .select();

    if (error || !data || data.length === 0) {
      throw new Error(error ? `Error al insertar: ${error.message}` : 'No se pudo crear la carga.');
    }

    return this.mapCarga(data[0] as CargaRow);
  }

  async saveCargaMeta(
    docenteId: string,
    periodoId: string,
    meta: Partial<Pick<CargaNoLectiva, 'horasLectivasAsignadas' | 'horasLectivasNoAsignadas' | 'lectivaDeclarada' | 'declaracionLectiva'>>,
  ): Promise<CargaNoLectiva> {
    const supabase = await createClient();
    const existing = await this.findCargaTotalByDocentePeriodo(docenteId, periodoId);

    const dbMeta: Record<string, unknown> = {};
    if (meta.horasLectivasAsignadas !== undefined) {
      dbMeta.horas_lectivas_asignadas = meta.horasLectivasAsignadas;
    }
    if (meta.horasLectivasNoAsignadas !== undefined) {
      dbMeta.horas_lectivas_no_asignadas = meta.horasLectivasNoAsignadas;
    }
    if (meta.lectivaDeclarada !== undefined) {
      dbMeta.lectiva_declarada = meta.lectivaDeclarada;
    }
    if (meta.declaracionLectiva !== undefined) {
      dbMeta.declaracion_lectiva = meta.declaracionLectiva;
    }

    const payload = {
      ...dbMeta,
      estado: existing?.estado ?? 'Borrador',
    };

    if (existing) {
      const { data, error } = await supabase
        .from('cargas_no_lectivas')
        .update(payload)
        .eq('id', existing.id)
        .select();

      if (error || !data || data.length === 0) {
        throw new Error(error ? `Error al actualizar declaración: ${error.message}` : 'No se encontró la carga para actualizar.');
      }

      return this.mapCarga(data[0] as CargaRow);
    }

    const insertPayload = {
      docente_id: docenteId,
      periodo_id: periodoId,
      total_horas: 0,
      ...dbMeta,
      estado: 'Borrador',
    };

    const { data, error } = await supabase
      .from('cargas_no_lectivas')
      .insert(insertPayload)
      .select();

    if (error || !data || data.length === 0) {
      throw new Error(error ? `Error al insertar declaración: ${error.message}` : 'No se pudo crear la carga.');
    }

    return this.mapCarga(data[0] as CargaRow);
  }

  async listCargasByPeriodo(periodoId: string): Promise<CargaNoLectivaWithDocente[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cargas_no_lectivas')
      .select('*')
      .eq('periodo_id', periodoId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const rows = data as CargaRow[];
    const docenteIds = Array.from(new Set(rows.map((row) => row.docente_id)));
    const { data: docentesData } = await supabase
      .from('docentes')
      .select('id, nombres, apellidos, correo')
      .in('id', docenteIds);

    const docentesMap: Record<string, { id: string; nombres: string; apellidos: string; correo: string }> = {};
    if (docentesData) {
      for (const docente of docentesData) {
        docentesMap[docente.id] = docente as { id: string; nombres: string; apellidos: string; correo: string };
      }
    }

    return rows.map((row) => {
      const docente = docentesMap[row.docente_id];
      return {
        ...this.mapCarga(row),
        docenteNombre: docente ? `${docente.nombres} ${docente.apellidos}`.trim() : 'Docente desconocido',
        docenteEmail: docente?.correo,
      };
    });
  }

  async approveCargaTotal(cargaId: string, role: 'director' | 'secretaria'): Promise<CargaNoLectiva> {
    const supabase = await createClient();
    const updateData: Partial<Record<string, unknown>> = {};

    if (role === 'director') {
      updateData.director_aprobado = true;
    }
    if (role === 'secretaria') {
      updateData.secretaria_aprobado = true;
    }

    const { data: currentData, error: currentError } = await supabase
      .from('cargas_no_lectivas')
      .select('*')
      .eq('id', cargaId)
      .maybeSingle();

    if (currentError || !currentData) {
      throw new Error(currentError?.message || 'Registro de carga no lectiva no encontrado.');
    }

    const current = this.mapCarga(currentData as CargaRow);
    const directorAprobado = role === 'director' ? true : current.directorAprobado;
    const secretariaAprobado = role === 'secretaria' ? true : current.secretariaAprobado;
    const estado = directorAprobado && secretariaAprobado ? 'Aprobado' : 'En revisión';

    const { data, error } = await supabase
      .from('cargas_no_lectivas')
      .update({
        ...updateData,
        estado,
      })
      .eq('id', cargaId)
      .select();

    if (error || !data || data.length === 0) {
      throw new Error(error ? `Error al aprobar: ${error.message}` : 'No se encontró la carga para aprobar.');
    }

    return this.mapCarga(data[0] as CargaRow);
  }

  private mapActividad(row: ActividadRow): ActividadNoLectiva {
    return {
      id: row.id,
      docenteId: row.docente_id,
      periodoId: row.periodo_id,
      tipo: row.tipo as ActividadNoLectivaTipo,
      horas: row.horas,
      detalles: row.detalles,
      dia: row.dia,
      bloque: row.bloque,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCarga(row: CargaRow): CargaNoLectiva {
    return {
      id: row.id,
      docenteId: row.docente_id,
      periodoId: row.periodo_id,
      horasLectivasAsignadas: row.horas_lectivas_asignadas,
      horasLectivasNoAsignadas: row.horas_lectivas_no_asignadas,
      lectivaDeclarada: row.lectiva_declarada,
      declaracionLectiva: row.declaracion_lectiva,
      totalHoras: row.total_horas,
      estado: row.estado as CargaNoLectiva['estado'],
      directorAprobado: row.director_aprobado,
      secretariaAprobado: row.secretaria_aprobado,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
