import * as XLSX from 'xlsx';

export interface DocenteExtraido {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string | null;
  categoria: string;
  regimen: string;
  condicion: string;
  escuela: string;
  fechaIngreso: string;
  cargaMaxima: number;
  cargaElectiva: number;
  estado: string;
}

export class DocenteParserService {
  async extraerDocentesDesdeExcel(buffer: Buffer): Promise<DocenteExtraido[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      const docentes: DocenteExtraido[] = [];
      
      // Buscar la fila de encabezados
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const headerText = row.join(' ').toLowerCase();
          if (headerText.includes('nombres') || headerText.includes('apellidos') || 
              headerText.includes('dni') || headerText.includes('correo')) {
            headerRowIndex = i;
            break;
          }
        }
      }
      
      // Si no se encontraron encabezados, asumir que la primera fila tiene datos
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 8) continue;
        
        const docente = this.extraerDocenteDeFila(row);
        if (docente) {
          docentes.push(docente);
        }
      }
      
      return docentes;
    } catch (error) {
      console.error('Error al parsear Excel:', error);
      throw new Error('No se pudo extraer la información del archivo Excel');
    }
  }
  
  async extraerDocentesDesdeCsv(buffer: Buffer): Promise<DocenteExtraido[]> {
    try {
      const text = buffer.toString('utf-8');
      const lines = text.split('\n').filter(line => line.trim());
      
      const docentes: DocenteExtraido[] = [];
      
      // Detectar delimitador (coma, punto y coma, tabulación)
      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes(';')) delimiter = ';';
      else if (firstLine.includes('\t')) delimiter = '\t';
      
      // Buscar fila de encabezados
      let headerRowIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('nombres') || line.includes('apellidos') || 
            line.includes('dni') || line.includes('correo')) {
          headerRowIndex = i;
          break;
        }
      }
      
      // Si no se encontraron encabezados, asumir que la primera fila tiene datos
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const row = line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
        const docente = this.extraerDocenteDeFila(row);
        if (docente) {
          docentes.push(docente);
        }
      }
      
      return docentes;
    } catch (error) {
      console.error('Error al parsear CSV:', error);
      throw new Error('No se pudo extraer la información del archivo CSV');
    }
  }
  
  private extraerDocenteDeFila(row: any[]): DocenteExtraido | null {
    if (row.length < 8) return null;
    
    return {
      nombres: this.extraerTexto(row[0]),
      apellidos: this.extraerTexto(row[1]),
      dni: this.extraerTexto(row[2]),
      correo: this.extraerTexto(row[3]),
      telefono: this.extraerTexto(row[4]) || null,
      categoria: this.extraerTexto(row[5]),
      regimen: this.extraerTexto(row[6]),
      condicion: this.extraerTexto(row[7]),
      escuela: this.extraerTexto(row[8]),
      fechaIngreso: this.extraerTexto(row[9]),
      cargaMaxima: this.extraerNumero(row[10]),
      cargaElectiva: this.extraerNumero(row[11]),
      estado: this.extraerTexto(row[12]) || 'Activo',
    };
  }
  
  private extraerTexto(valor: any): string {
    if (!valor) return '';
    return String(valor).trim();
  }
  
  private extraerNumero(valor: any): number {
    if (!valor) return 0;
    const num = parseInt(String(valor));
    return isNaN(num) ? 0 : num;
  }
}
