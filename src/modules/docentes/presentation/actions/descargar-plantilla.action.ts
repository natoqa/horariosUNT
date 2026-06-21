'use server';

import { PlantillaGeneratorService } from '../../infrastructure/plantilla-generator.service';

export async function descargarPlantillaDocentesAction(formato: 'excel' | 'csv' = 'excel') {
  try {
    const generator = new PlantillaGeneratorService();
    const buffer = generator.generarPlantillaDocentes(formato);
    
    const filename = `plantilla_docentes.${formato === 'excel' ? 'xlsx' : 'csv'}`;
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
