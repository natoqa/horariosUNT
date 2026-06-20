'use server';

import { revalidatePath } from 'next/cache';
import { SavePlanEstudioUseCase } from '../../application/use-cases/save-plan-estudio.use-case';
import { savePlanEstudioSchema } from '../../application/dtos/save-plan-estudio.dto';
import { PdfStorageService } from '../../infrastructure/pdf-storage.service';
import { PdfParserService, CursoExtraido } from '../../infrastructure/pdf-parser.service';
import { ExcelParserService } from '../../infrastructure/excel-parser.service';
import { CsvParserService } from '../../infrastructure/csv-parser.service';
import { SupabasePlanEstudioRepository } from '../../infrastructure/supabase-plan-estudio.repository';
import { SupabaseCursoRepository } from '@/modules/cursos/infrastructure/supabase-curso.repository';

export async function savePlanEstudioAction(formData: FormData) {
  try {
    const nombre = formData.get('nombre')?.toString() ?? '';
    const anio = formData.get('anio')?.toString() ?? '';
    const archivo = formData.get('archivo') as File | null;
    const estado = formData.get('estado')?.toString() ?? 'Activo';
    const fechaPublicacion = formData.get('fechaPublicacion')?.toString() ?? '';

    // Primero crear el plan de estudios para obtener el ID
    const validatedData = savePlanEstudioSchema.parse({
      nombre,
      anio,
      pdfUrl: undefined,
      estado,
      fechaPublicacion: fechaPublicacion || undefined,
    });

    const repo = new SupabasePlanEstudioRepository();
    const useCase = new SavePlanEstudioUseCase(repo);
    const plan = await useCase.execute(validatedData);

    // Si hay un archivo, procesarlo según su tipo
    let archivoUrl: string | undefined;
    let cursosExtraidos: CursoExtraido[] = [];
    
    if (archivo) {
      const pdfService = new PdfStorageService();
      archivoUrl = await pdfService.uploadPdf(archivo, plan.id);
      
      // Actualizar el plan con la URL del archivo
      const { UpdatePlanEstudioUseCase } = await import('../../application/use-cases/update-plan-estudio.use-case');
      const updateUseCase = new UpdatePlanEstudioUseCase(repo);
      await updateUseCase.execute(plan.id, { pdfUrl: archivoUrl });
      
      // Extraer cursos según el tipo de archivo
      const arrayBuffer = await archivo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = archivo.type;
      
      if (fileType === 'application/pdf') {
        const parser = new PdfParserService();
        cursosExtraidos = await parser.extraerCursosDesdePdf(buffer);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel'
      ) {
        const parser = new ExcelParserService();
        cursosExtraidos = await parser.extraerCursosDesdeExcel(buffer);
      } else if (fileType === 'text/csv' || fileType === 'application/csv') {
        const parser = new CsvParserService();
        cursosExtraidos = await parser.extraerCursosDesdeCsv(buffer);
      }
      
      // Crear cursos extraídos
      if (cursosExtraidos.length > 0) {
        const cursoRepo = new SupabaseCursoRepository();
        for (const curso of cursosExtraidos) {
          try {
            await cursoRepo.save({
              ...curso,
              ciclo: curso.ciclo as 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X',
              tipo: curso.tipo as 'Teórico' | 'Práctico' | 'Teórico-Práctico',
              requiereLaboratorio: false,
              tipoLaboratorio: null,
              estado: 'Activo',
              planEstudioId: plan.id,
            });
          } catch (error) {
            console.error(`Error al crear curso ${curso.codigo}:`, error);
            // Continuar con el siguiente curso si falla uno
          }
        }
      }
    }

    revalidatePath('/director/planes-estudio');
    revalidatePath('/director/cursos');
    return { 
      success: true, 
      error: null,
      cursosCreados: cursosExtraidos.length,
    };
  } catch (error) {
    console.error('Error al guardar plan de estudios:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al guardar plan de estudios' };
  }
}
