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
      
      // Si no se encontraron encabezados, asumir que la primera fila tiene datos
      const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      
      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 4) continue;
        
        // Intentar extraer datos de diferentes columnas
        const curso = this.extraerCursoDeFila(row);
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
  
  private extraerCursoDeFila(row: any[]): CursoExtraido | null {
    // Intentar diferentes patrones de columnas
    // Patrón 1: Código, Nombre, Ciclo, HT, HP, Créditos
    if (row.length >= 6) {
      const codigo = this.extraerCodigo(row[0]);
      const nombre = this.extraerTexto(row[1]);
      const ciclo = this.extraerCiclo(row[2]);
      const ht = this.extraerNumero(row[3]);
      const hp = this.extraerNumero(row[4]);
      const creditos = this.extraerNumero(row[5]);
      
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
    }
    
    // Patrón 2: Código, Nombre, HT, HP, Créditos (sin ciclo)
    if (row.length >= 5) {
      const codigo = this.extraerCodigo(row[0]);
      const nombre = this.extraerTexto(row[1]);
      const ht = this.extraerNumero(row[2]);
      const hp = this.extraerNumero(row[3]);
      const creditos = this.extraerNumero(row[4]);
      
      if (codigo && nombre) {
        return {
          codigo,
          nombre,
          ciclo: 'I', // Ciclo por defecto
          tipo: this.determinarTipo(ht, hp),
          horasTeoricas: ht,
          horasPracticas: hp,
          creditos,
        };
      }
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
