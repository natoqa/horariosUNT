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
      
      // Construir mapa de índices
      let indices = this.obtenerIndicesDefectos();
      if (headerRowIndex >= 0) {
        const rowHeaders = jsonData[headerRowIndex].map(h => String(h || ''));
        const mappedIndices = this.obtenerMapDeIndices(rowHeaders);
        // Validar si encontramos al menos los campos obligatorios
        if (mappedIndices.nombres !== -1 && mappedIndices.apellidos !== -1 && mappedIndices.dni !== -1 && mappedIndices.correo !== -1) {
          indices = mappedIndices;
        }
      }
      
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 4) continue; // Al menos nombres, apellidos, dni, correo
        
        const docente = this.extraerDocenteDeFila(row, indices);
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
      
      // Construir mapa de índices
      let indices = this.obtenerIndicesDefectos();
      if (headerRowIndex >= 0) {
        const lineHeaders = lines[headerRowIndex].split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
        const mappedIndices = this.obtenerMapDeIndices(lineHeaders);
        if (mappedIndices.nombres !== -1 && mappedIndices.apellidos !== -1 && mappedIndices.dni !== -1 && mappedIndices.correo !== -1) {
          indices = mappedIndices;
        }
      }
      
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const row = line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
        if (row.length < 4) continue;
        
        const docente = this.extraerDocenteDeFila(row, indices);
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

  private obtenerIndicesDefectos(): Record<string, number> {
    return {
      nombres: 0,
      apellidos: 1,
      dni: 2,
      correo: 3,
      telefono: 4,
      categoria: 5,
      regimen: 6,
      condicion: 7,
      escuela: 8,
      fechaIngreso: 9,
      cargaMaxima: 10,
      cargaElectiva: 11,
      estado: 12,
    };
  }

  private obtenerMapDeIndices(headers: string[]): Record<string, number> {
    const clean = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar acentos
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]/g, ""); // quitar espacios/símbolos
    };

    const cleanHeaders = headers.map(clean);

    return {
      nombres: cleanHeaders.indexOf('nombres'),
      apellidos: cleanHeaders.indexOf('apellidos'),
      dni: cleanHeaders.indexOf('dni'),
      correo: cleanHeaders.indexOf('correo'),
      telefono: cleanHeaders.indexOf('telefono'),
      categoria: cleanHeaders.indexOf('categoria'),
      regimen: cleanHeaders.indexOf('regimen'),
      condicion: cleanHeaders.indexOf('condicion'),
      escuela: cleanHeaders.indexOf('escuela'),
      fechaIngreso: cleanHeaders.indexOf('fechaingreso'),
      cargaMaxima: cleanHeaders.indexOf('cargamaxima'),
      cargaElectiva: cleanHeaders.indexOf('cargaelectiva'),
      estado: cleanHeaders.indexOf('estado'),
    };
  }
  
  private extraerDocenteDeFila(row: any[], indices: Record<string, number>): DocenteExtraido | null {
    const getValue = (idx: number) => {
      return idx !== -1 && idx < row.length ? row[idx] : null;
    };
    
    return {
      nombres: this.extraerTexto(getValue(indices.nombres)),
      apellidos: this.extraerTexto(getValue(indices.apellidos)),
      dni: this.extraerTexto(getValue(indices.dni)),
      correo: this.extraerTexto(getValue(indices.correo)),
      telefono: this.extraerTexto(getValue(indices.telefono)) || null,
      categoria: this.extraerTexto(getValue(indices.categoria)),
      regimen: this.extraerTexto(getValue(indices.regimen)),
      condicion: this.extraerTexto(getValue(indices.condicion)),
      escuela: this.extraerTexto(getValue(indices.escuela)),
      fechaIngreso: this.extraerTexto(getValue(indices.fechaIngreso)),
      cargaMaxima: this.extraerNumero(getValue(indices.cargaMaxima)),
      cargaElectiva: this.extraerNumero(getValue(indices.cargaElectiva)),
      estado: this.extraerTexto(getValue(indices.estado)) || 'Activo',
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
