import { IPlanEstudioRepository } from '../../domain/repositories/plan-estudio.repository';
import { SupabasePlanEstudioRepository } from '../../infrastructure/supabase-plan-estudio.repository';
import { SavePlanEstudioInput } from '../dtos/save-plan-estudio.dto';

export class SavePlanEstudioUseCase {
  private repository: IPlanEstudioRepository;

  constructor(repository?: IPlanEstudioRepository) {
    this.repository = repository || new SupabasePlanEstudioRepository();
  }

  async execute(data: SavePlanEstudioInput) {
    // Normalizar el estado para asegurar que coincida con el constraint de la base de datos
    const estadoNormalizado = (data.estado?.trim() || 'Activo') as 'Activo' | 'Inactivo';
    
    return this.repository.create({
      nombre: data.nombre,
      anio: data.anio,
      pdfUrl: data.pdfUrl || null,
      estado: estadoNormalizado,
      fechaPublicacion: data.fechaPublicacion || null,
    });
  }
}
