'use server';

import { GetPlanesEstudioUseCase } from '../../application/use-cases/get-planes-estudio.use-case';

export async function getPlanesEstudioAction() {
  try {
    const useCase = new GetPlanesEstudioUseCase();
    const planes = await useCase.execute();
    return { data: planes, error: null };
  } catch (error) {
    console.error('Error al obtener planes de estudio:', error);
    return { data: null, error: 'Error al obtener planes de estudio' };
  }
}
