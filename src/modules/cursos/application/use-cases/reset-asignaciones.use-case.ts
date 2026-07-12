import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';
import { IHorarioRepository } from '../../../horarios/domain/repositories/horario.repository';
import { SupabaseHorarioRepository } from '../../../horarios/infrastructure/supabase-horario.repository';

export class ResetAsignacionesUseCase {
  private cursoRepository: ICursoRepository;
  private horarioRepository: IHorarioRepository;

  constructor(cursoRepository?: ICursoRepository, horarioRepository?: IHorarioRepository) {
    this.cursoRepository = cursoRepository || new SupabaseCursoRepository();
    this.horarioRepository = horarioRepository || new SupabaseHorarioRepository();
  }

  async execute(periodoId: string): Promise<void> {
    // Primero borrar el horario (y sus asignaciones)
    const horario = await this.horarioRepository.findByPeriodo(periodoId);
    if (horario) {
      await this.horarioRepository.deleteAsignacionesByHorario(horario.id);
      // Borrar el horario mismo
      const { createClient } = await import('@/shared/lib/supabase/server');
      const supabase = await createClient();
      await supabase.from('horarios').delete().eq('id', horario.id);
    }

    // Luego borrar los grupos
    return this.cursoRepository.resetAsignaciones(periodoId);
  }
}