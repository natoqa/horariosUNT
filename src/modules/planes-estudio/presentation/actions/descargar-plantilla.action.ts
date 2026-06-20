'use server';

import { PlantillaGeneratorService } from '../../infrastructure/plantilla-generator.service';

export async function descargarPlantillaCursosAction(formato: 'excel' | 'csv' = 'excel') {
  try {
    const generator = new PlantillaGeneratorService();
    const buffer = generator.generarPlantillaCursos(formato);
    
    const filename = `plantilla_cursos.${formato === 'excel' ? 'xlsx' : 'csv'}`;
    const mimeType = formato === 'excel' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';
    
    return {
      success: true,
      buffer,
      filename,
      mimeType,
    };
  } catch (error) {
    console.error('Error al generar plantilla:', error);
    return {
      success: false,
      error: 'Error al generar plantilla',
    };
  }
}
