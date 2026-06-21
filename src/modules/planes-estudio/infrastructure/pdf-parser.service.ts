import * as pdfjsLib from 'pdfjs-dist';

export interface CursoExtraido {
  codigo: string;
  nombre: string;
  ciclo: string;
  tipo: string;
  horasTeoricas: number;
  horasPracticas: number;
  creditos: number;
}

export class PdfParserService {
  async extraerCursosDesdePdf(pdfBuffer: Buffer): Promise<CursoExtraido[]> {
    try {
      // Configurar worker de PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // Cargar el documento PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
      const pdfDocument = await loadingTask.promise;

      let texto = '';

      // Extraer texto de todas las páginas
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        texto += pageText + '\n';
      }
      
      const cursos: CursoExtraido[] = [];
      const lineas = texto.split('\n').filter(linea => linea.trim());
      
      // Múltiples patrones para diferentes formatos de PDF
      const patrones = [
        // Formato 1: CÓDIGO NOMBRE CICLO HT HP CRÉDITOS (formato estándar)
        /([A-Z]{2,4}\d{3,4})\s+(.+?)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i,
        // Formato 2: CÓDIGO | NOMBRE | CICLO | HT | HP | CRÉDITOS (con separadores)
        /([A-Z]{2,4}\d{3,4})\s*[|;]\s*(.+?)\s*[|;]\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)\s*[|;]\s*(\d+)\s*[|;]\s*(\d+)\s*[|;]\s*(\d+)/i,
        // Formato 3: CÓDIGO - NOMBRE - CICLO - HT - HP - CRÉDITOS (con guiones)
        /([A-Z]{2,4}\d{3,4})\s*-\s*(.+?)\s*-\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/i,
        // Formato 4: Tabular con espacios múltiples
        /([A-Z]{2,4}\d{3,4})\s{2,}(.+?)\s{2,}(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)\s{2,}(\d+)\s{2,}(\d+)\s{2,}(\d+)/i,
        // Formato 5: CÓDIGO, NOMBRE, CICLO, HT, HP, CRÉDITOS (CSV)
        /([A-Z]{2,4}\d{3,4}),\s*([^,]+),\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+),\s*(\d+),\s*(\d+),\s*(\d+)/i,
      ];
      
      for (const linea of lineas) {
        let match = null;
        let patternIndex = 0;
        
        // Intentar cada patrón hasta encontrar uno que coincida
        for (let i = 0; i < patrones.length; i++) {
          match = linea.match(patrones[i]);
          if (match) {
            patternIndex = i;
            break;
          }
        }
        
        if (match) {
          const [, codigo, nombre, ciclo, horasTeoricas, horasPracticas, creditos] = match;
          
          // Determinar tipo de curso basado en horas
          let tipo = 'Teórico-Práctico';
          const ht = parseInt(horasTeoricas);
          const hp = parseInt(horasPracticas);
          
          if (ht > 0 && hp === 0) {
            tipo = 'Teórico';
          } else if (ht === 0 && hp > 0) {
            tipo = 'Práctico';
          }
          
          cursos.push({
            codigo: codigo.toUpperCase(),
            nombre: nombre.trim(),
            ciclo: this.normalizarCiclo(ciclo),
            tipo,
            horasTeoricas: ht,
            horasPracticas: hp,
            creditos: parseInt(creditos),
          });
        }
      }
      
      return cursos;
    } catch (error) {
      console.error('Error al parsear PDF:', error);
      throw new Error('No se pudo extraer la información del PDF');
    }
  }
  
  private normalizarCiclo(ciclo: string): string {
    const cicloNormalizado = ciclo.toUpperCase().trim();
    const ciclosValidos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    
    if (ciclosValidos.includes(cicloNormalizado)) {
      return cicloNormalizado;
    }
    
    // Intentar convertir números romanos
    const romanos: Record<string, string> = {
      '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
      '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X'
    };
    
    const convertido = romanos[cicloNormalizado];
    if (convertido && ciclosValidos.includes(convertido)) {
      return convertido;
    }
    
    // Si no es válido, retornar 'I' por defecto
    return 'I';
  }
}
