import { Disponibilidad, DisponibilidadEstado } from '../entities/disponibilidad.entity';
import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface DisponibilidadBlock {
  dia: DiaSemana;
  bloque: BloqueHorario;
  estado: DisponibilidadEstado;
}

export interface IDisponibilidadRepository {
  findByDocenteAndPeriodo(docenteId: string, periodoId: string): Promise<Disponibilidad[]>;
  saveBulk(docenteId: string, periodoId: string, blocks: DisponibilidadBlock[]): Promise<Disponibilidad[]>;
}
