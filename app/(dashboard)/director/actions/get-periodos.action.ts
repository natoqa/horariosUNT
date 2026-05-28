'use server'

import { SupabasePeriodoRepository } from '@/modules/periodos/infrastructure/supabase-periodo.repository';
import { GetPeriodosUseCase } from '@/modules/periodos/application/use-cases/get-periodos.use-case';
import { Periodo } from '@/modules/periodos/domain/entities/periodo.entity';

export interface PeriodoDisplay {
  id: string;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
  tipoCiclo: string;
}

export async function getPeriodosAction(): Promise<PeriodoDisplay[]> {
  const periodoRepo = new SupabasePeriodoRepository();
  const periodosUseCase = new GetPeriodosUseCase(periodoRepo);

  const periodos = await periodosUseCase.execute();

  return periodos.map((p: Periodo) => ({
    id: p.id,
    name: p.name,
    state: p.state,
    startDate: p.startDate,
    endDate: p.endDate,
    tipoCiclo: p.tipoCiclo,
  }));
}
