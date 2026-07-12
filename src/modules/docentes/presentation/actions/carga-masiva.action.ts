'use server';

import { revalidatePath } from 'next/cache';
import { DocenteParserService } from '../../infrastructure/docente-parser.service';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';

export async function cargaMasivaDocentesAction(formData: FormData) {
  try {
    const archivo = formData.get('archivo') as File | null;
    
    if (!archivo) {
      return { success: false, error: 'No se proporcionó ningún archivo' };
    }
    
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = archivo.type;
    const filename = archivo.name.toLowerCase();
    
    const isCsv = filename.endsWith('.csv') || fileType === 'text/csv' || fileType === 'application/csv';
    const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls') || 
                    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    fileType === 'application/vnd.ms-excel';

    const parser = new DocenteParserService();
    let docentesExtraidos: any[] = [];
    
    if (isCsv) {
      docentesExtraidos = await parser.extraerDocentesDesdeCsv(buffer);
    } else if (isExcel) {
      docentesExtraidos = await parser.extraerDocentesDesdeExcel(buffer);
    } else {
      return { success: false, error: 'Formato de archivo no soportado. Use Excel (.xlsx, .xls) o CSV' };
    }
    
    if (docentesExtraidos.length === 0) {
      return { success: false, error: 'No se encontraron docentes en el archivo' };
    }
    
    // Crear docentes extraídos
    const docenteRepo = new SupabaseDocenteRepository();
    let docentesCreados = 0;
    let errores: string[] = [];
    
    for (const docente of docentesExtraidos) {
      try {
        await docenteRepo.save({
          nombres: docente.nombres,
          apellidos: docente.apellidos,
          dni: docente.dni,
          correo: docente.correo,
          telefono: docente.telefono,
          categoria: docente.categoria as any,
          regimen: docente.regimen as any,
          condicion: docente.condicion as any,
          escuela: docente.escuela as any,
          fechaIngreso: docente.fechaIngreso,
          cargaMaxima: docente.cargaMaxima,
          cargaElectiva: docente.cargaElectiva,
          estado: docente.estado as 'Activo' | 'Inactivo',
        });
        docentesCreados++;
      } catch (error) {
        console.error(`Error al crear docente ${docente.dni}:`, error);
        errores.push(`DNI ${docente.dni}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    revalidatePath('/director/docentes');
    revalidatePath('/secretaria/docentes');
    
    return { 
      success: true, 
      error: null,
      docentesCreados,
      totalDocentes: docentesExtraidos.length,
      errores: errores.length > 0 ? errores : undefined,
    };
  } catch (error) {
    console.error('Error al cargar docentes masivamente:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al cargar docentes masivamente' };
  }
}
