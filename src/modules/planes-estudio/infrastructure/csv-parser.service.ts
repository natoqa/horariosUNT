export interface CursoExtraido {
  codigo: string;
  nombre: string;
  ciclo: string;
  tipo: string;
  horasTeoricas: number;
  horasPracticas: number;
  creditos: number;
}

export class CsvParserService {
  async extraerCursosDesdeCsv(buffer: Buffer): Promise<CursoExtraido[]> {
    try {
      const text = buffer.toString('utf-8');
      const lines = text.split('\n').filter(line => line.trim());
      
      const cursos: CursoExtraido[] = [];
      
      // Detectar delimitador (coma, punto y coma, tabulación)
      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes(';')) delimiter = ';';
      else if (firstLine.includes('\t')) delimiter = '\t';
      
      // Buscar fila de encabezados
      let headerRowIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('código') || line.includes('codigo') || 
            line.includes('curso') || line.includes('nombre')) {
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
        const curso = this.extraerCursoDeFila(row);
        if (curso) {
          cursos.push(curso);
        }
      }
      
      return cursos;
    } catch (error) {
      console.error('Error al parsear CSV:', error);
      throw new Error('No se pudo extraer la información del archivo CSV');
    }
  }
  
  private extraerCursoDeFila(row: string[]): CursoExtraido | null {
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
  
  private extraerCodigo(valor: string): string {
    if (!valor) return '';
    const match = valor.match(/([A-Z]{2,4}\d{3,4})/i);
    return match ? match[1].toUpperCase() : valor.toUpperCase();
  }
  
  private extraerTexto(valor: string): string {
    if (!valor) return '';
    return valor.trim();
  }
  
  private extraerCiclo(valor: string): string {
    if (!valor) return 'I';
    const str = valor.toUpperCase().trim();
    const ciclosValidos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    
    if (ciclosValidos.includes(str)) {
      return str;
    }
    
    const romanos: Record<string, string> = {
      '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
      '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X'
    };
    
    return romanos[str] || 'I';
  }
  
  private extraerNumero(valor: string): number {
    if (!valor) return 0;
    const num = parseInt(valor);
    return isNaN(num) ? 0 : num;
  }
  
  private determinarTipo(ht: number, hp: number): string {
    if (ht > 0 && hp === 0) return 'Teórico';
    if (ht === 0 && hp > 0) return 'Práctico';
    return 'Teórico-Práctico';
  }
}
