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
import { Curso } from '@/modules/cursos/domain/entities/curso.entity';

export async function savePlanEstudioAction(formData: FormData) {
  try {
    const nombre = formData.get('nombre')?.toString() ?? '';
    const anio = formData.get('anio')?.toString() ?? '';
    const archivo = formData.get('archivo') as File | null;
    const estado = formData.get('estado')?.toString() ?? 'Activo';
    const fechaPublicacion = formData.get('fechaPublicacion')?.toString() ?? '';

    console.log('Datos recibidos:', { nombre, anio, estado, fechaPublicacion });

    // Validar tamaño de archivo (10MB máximo)
    if (archivo && archivo.size > 10 * 1024 * 1024) {
      return { success: false, error: 'El archivo excede el tamaño máximo de 10MB' };
    }

    // Primero crear el plan de estudios para obtener el ID
    const anioNum = parseInt(anio);
    
    console.log('Valor convertido:', { anioNum });
    
    const validatedData = savePlanEstudioSchema.parse({
      nombre,
      anio: anioNum,
      pdfUrl: '', // Usar string vacío en lugar de undefined para validación
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
      console.log('Procesando archivo:', archivo.name, 'Tipo:', archivo.type, 'Tamaño:', archivo.size);
      const arrayBuffer = await archivo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = archivo.type;
      
      console.log('Buffer creado, tamaño:', buffer.length);
      
      // Extraer cursos según el tipo de archivo
      if (fileType === 'application/pdf') {
        console.log('Procesando archivo PDF');
        const pdfService = new PdfStorageService();
        archivoUrl = await pdfService.uploadPdf(archivo, plan.id);
        
        // Actualizar el plan con la URL del archivo
        const { UpdatePlanEstudioUseCase } = await import('../../application/use-cases/update-plan-estudio.use-case');
        const updateUseCase = new UpdatePlanEstudioUseCase(repo);
        await updateUseCase.execute(plan.id, {
          nombre: plan.nombre,
          anio: plan.anio,
          pdfUrl: archivoUrl,
          estado: plan.estado,
          fechaPublicacion: plan.fechaPublicacion || undefined,
        });
        
        const parser = new PdfParserService();
        cursosExtraidos = await parser.extraerCursosDesdePdf(buffer);
        console.log('Cursos extraídos del PDF:', cursosExtraidos.length);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/octet-stream' ||
        fileType === 'application/excel'
      ) {
        console.log('Procesando archivo Excel');
        try {
          const parser = new ExcelParserService();
          cursosExtraidos = await parser.extraerCursosDesdeExcel(buffer);
          console.log('Cursos extraídos del Excel:', cursosExtraidos.length);
          if (cursosExtraidos.length > 0) {
            console.log('Primer curso extraído:', JSON.stringify(cursosExtraidos[0], null, 2));
          }
        } catch (excelError) {
          console.error('Error al procesar Excel:', excelError);
          throw new Error(`Error al procesar archivo Excel: ${excelError instanceof Error ? excelError.message : 'Error desconocido'}`);
        }
      } else if (fileType === 'text/csv' || fileType === 'application/csv' || fileType === 'text/comma-separated-values') {
        console.log('Procesando archivo CSV');
        const parser = new CsvParserService();
        cursosExtraidos = await parser.extraerCursosDesdeCsv(buffer);
        console.log('Cursos extraídos del CSV:', cursosExtraidos.length);
      } else {
        console.log('Tipo de archivo no soportado:', fileType);
        return { success: false, error: 'Tipo de archivo no soportado. Use PDF, Excel (.xlsx, .xls) o CSV' };
      }
      
      // Validar límite de cursos (200 máximo)
      if (cursosExtraidos.length > 200) {
        return { success: false, error: `El archivo contiene ${cursosExtraidos.length} cursos. El máximo permitido es 200 cursos por carga.` };
      }
      
      // Crear cursos extraídos
      if (cursosExtraidos.length > 0) {
        console.log(`Intentando crear ${cursosExtraidos.length} cursos...`);
        const cursoRepo = new SupabaseCursoRepository();
        const cursosFallidos: Array<{ codigo: string; nombre: string; error: string }> = [];
        
        // Verificar duplicados antes de crear
        const codigosExistentes = new Set<string>();
        const cursosValidos: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        
        // Validar tipos antes de crear
        const ciclosValidos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        const tiposValidos = ['Teórico', 'Práctico', 'Teórico-Práctico'];
        
        for (const curso of cursosExtraidos) {
          // Verificar duplicados en el archivo
          if (codigosExistentes.has(curso.codigo)) {
            cursosFallidos.push({ codigo: curso.codigo, nombre: curso.nombre, error: 'Código duplicado en el archivo' });
            continue;
          }
          codigosExistentes.add(curso.codigo);
          
          // Validar ciclo
          if (!ciclosValidos.includes(curso.ciclo)) {
            cursosFallidos.push({ codigo: curso.codigo, nombre: curso.nombre, error: `Ciclo inválido: ${curso.ciclo}` });
            continue;
          }
          
          // Validar tipo
          if (!tiposValidos.includes(curso.tipo)) {
            cursosFallidos.push({ codigo: curso.codigo, nombre: curso.nombre, error: `Tipo inválido: ${curso.tipo}` });
            continue;
          }
          
          // Agregar a lista de cursos válidos
          cursosValidos.push({
            ...curso,
            ciclo: curso.ciclo as 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X',
            tipo: curso.tipo as 'Teórico' | 'Práctico' | 'Teórico-Práctico',
            requiereLaboratorio: false,
            tipoLaboratorio: null,
            estado: 'Activo',
            planEstudioId: plan.id,
          });
        }
        
        // Procesar cursos uno por uno para manejar duplicados
        let cursosCreados = 0;
        
        if (cursosValidos.length > 0) {
          console.log(`Procesando ${cursosValidos.length} cursos...`);
          
          for (const curso of cursosValidos) {
            try {
              // Verificar si el curso ya existe
              const cursoExistente = await cursoRepo.findByCodigo(curso.codigo);
              
              if (cursoExistente) {
                console.log(`Curso ${curso.codigo} ya existe, actualizando...`);
                await cursoRepo.update(cursoExistente.id, {
                  nombre: curso.nombre,
                  ciclo: curso.ciclo,
                  tipo: curso.tipo,
                  horasTeoricas: curso.horasTeoricas,
                  horasPracticas: curso.horasPracticas,
                  creditos: curso.creditos,
                  requiereLaboratorio: curso.requiereLaboratorio,
                  tipoLaboratorio: curso.tipoLaboratorio,
                  estado: curso.estado,
                  planEstudioId: curso.planEstudioId,
                });
                console.log(`Curso ${curso.codigo} actualizado exitosamente`);
                cursosCreados++;
              } else {
                console.log(`Creando nuevo curso: ${curso.codigo}`);
                await cursoRepo.save(curso);
                console.log(`Curso ${curso.codigo} creado exitosamente`);
                cursosCreados++;
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
              console.error(`Error al procesar curso ${curso.codigo}:`, error);
              cursosFallidos.push({ codigo: curso.codigo, nombre: curso.nombre, error: errorMsg });
            }
          }
          
          console.log(`Cursos procesados: ${cursosCreados} exitosos, ${cursosFallidos.length} fallidos`);
        }
        
        // Retornar resultado detallado
        if (cursosFallidos.length > 0) {
          return { 
            success: true, 
            error: null,
            cursosCreados: cursosCreados,
            cursosFallidos: cursosFallidos.length,
            detallesFallidos: cursosFallidos,
            mensajeParcial: cursosCreados > 0 
              ? `Se procesaron ${cursosCreados} cursos exitosamente, pero ${cursosFallidos.length} fallaron.` 
              : 'No se pudo procesar ningún curso.'
          };
        }
      } else {
        console.log('No se extrajeron cursos del archivo');
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
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
      // Proporcionar mensajes de error más específicos
      if (error.message.includes('nombre')) {
        return { success: false, error: `Error en el nombre: ${error.message}` };
      }
      if (error.message.includes('anio') || error.message.includes('año')) {
        return { success: false, error: `Error en el año: ${error.message}` };
      }
      if (error.message.includes('pdfUrl') || error.message.includes('pdf')) {
        return { success: false, error: `Error en el PDF: ${error.message}` };
      }
      return { success: false, error: error.message };
    }
    
    // Si es un error de Zod
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string; path: string[] }> };
      const messages = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { success: false, error: `Error de validación: ${messages}` };
    }
    
    return { success: false, error: 'Error al guardar plan de estudios. Por favor revise los datos e intente nuevamente.' };
  }
}
