import * as XLSX from 'xlsx';

export interface CursoExtraido {
  codigo: string;
  nombre: string;
  ciclo: string;
  tipo: string;
  horasTeoricas: number;
  horasPracticas: number;
  creditos: number;
}

export class ExcelParserService {
  async extraerCursosDesdeExcel(buffer: Buffer): Promise<CursoExtraido[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      const cursos: CursoExtraido[] = [];
      
      // Buscar la fila de encabezados
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const headerText = row.join(' ').toLowerCase();
          if (headerText.includes('código') || headerText.includes('codigo') || 
              headerText.includes('curso') || headerText.includes('nombre')) {
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
        if (mappedIndices.codigo !== -1 && mappedIndices.nombre !== -1) {
          indices = mappedIndices;
        }
      }
      
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue; // Al menos codigo y nombre
        
        const curso = this.extraerCursoDeFila(row, indices);
        if (curso) {
          cursos.push(curso);
        }
      }
      
      return cursos;
    } catch (error) {
      console.error('Error al parsear Excel:', error);
      throw new Error('No se pudo extraer la información del archivo Excel');
    }
  }

  private obtenerIndicesDefectos(): Record<string, number> {
    return {
      codigo: 0,
      nombre: 1,
      ciclo: 2,
      horasTeoricas: 3,
      horasPracticas: 4,
      creditos: 5,
    };
  }

  private obtenerMapDeIndices(headers: string[]): Record<string, number> {
    const clean = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar acentos
        .replace(/[^a-z0-9]/g, ""); // quitar espacios/símbolos
    };

    const cleanHeaders = headers.map(clean);

    return {
      codigo: cleanHeaders.indexOf('codigo'),
      nombre: cleanHeaders.indexOf('nombre'),
      ciclo: cleanHeaders.indexOf('ciclo'),
      horasTeoricas: cleanHeaders.findIndex(h => h === 'horasteoricas' || h === 'ht'),
      horasPracticas: cleanHeaders.findIndex(h => h === 'horaspracticas' || h === 'hp'),
      creditos: cleanHeaders.indexOf('creditos'),
    };
  }
  
  private extraerCursoDeFila(row: any[], indices: Record<string, number>): CursoExtraido | null {
    const getValue = (idx: number) => {
      return idx !== -1 && idx < row.length ? row[idx] : null;
    };

    const codigo = this.extraerCodigo(this.extraerTexto(getValue(indices.codigo)));
    const nombre = this.extraerTexto(getValue(indices.nombre));
    const ciclo = this.extraerCiclo(this.extraerTexto(getValue(indices.ciclo)));
    const ht = this.extraerNumero(this.extraerTexto(getValue(indices.horasTeoricas)));
    const hp = this.extraerNumero(this.extraerTexto(getValue(indices.horasPracticas)));
    const creditos = this.extraerNumero(this.extraerTexto(getValue(indices.creditos)));
    
    if (codigo && nombre) {
      return {
        codigo,
        nombre,
        ciclo,
        tipo: this.determinarTipo(ht, hp),
        horasTeoricas: ht,
        horasPracticas: hp,
        creditos,
      };
    }
    
    return null;
  }
  
  private extraerCodigo(valor: any): string {
    if (!valor) return '';
    const str = String(valor).trim();
    const match = str.match(/([A-Z]{2,4}\d{3,4})/i);
    return match ? match[1].toUpperCase() : str.toUpperCase();
  }
  
  private extraerTexto(valor: any): string {
    if (!valor) return '';
    return String(valor).trim();
  }
  
  private extraerCiclo(valor: any): string {
    if (!valor) return 'I';
    const str = String(valor).toUpperCase().trim();
    const ciclosValidos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    
    if (ciclosValidos.includes(str)) {
      return str;
    }
    
    const romanos: Record<string, string> = {
      '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
      '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X'
    };
    
    const convertido = romanos[str];
    if (convertido && ciclosValidos.includes(convertido)) {
      return convertido;
    }
    
    // Si no es válido, retornar 'I' por defecto
    return 'I';
  }
  
  private extraerNumero(valor: any): number {
    if (!valor) return 0;
    const num = parseInt(String(valor));
    return isNaN(num) ? 0 : num;
  }
  
  private determinarTipo(ht: number, hp: number): string {
    if (ht > 0 && hp === 0) return 'Teórico';
    if (ht === 0 && hp > 0) return 'Práctico';
    return 'Teórico-Práctico';
  }
}
