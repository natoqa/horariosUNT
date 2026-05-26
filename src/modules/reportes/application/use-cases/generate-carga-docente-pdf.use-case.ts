import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

export interface CargaDocentePdfRow {
  nombre: string;
  categoria: string;
  regimen: string;
  horasAsignadas: number;
  horasMaximas: number;
  porcentaje: number;
  cursos: string;
}

export class GenerateCargaDocentePdfUseCase {
  async execute(
    rows: CargaDocentePdfRow[],
    periodoName: string,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([842, 595]);
    const { width } = page.getSize();

    let yPos = 555;
    yPos = this.drawHeader(page, fontBold, font, width, yPos, periodoName);
    yPos -= 10;
    yPos = this.drawTableHeader(page, font, fontBold, width, yPos);

    for (const row of rows) {
      if (yPos < 60) {
        this.drawFooter(page, font, width, periodoName);
        page = pdfDoc.addPage([842, 595]);
        yPos = 555;
        yPos = this.drawTableHeader(page, font, fontBold, width, yPos);
      }
      yPos = this.drawRow(page, font, row, width, yPos);
    }

    this.drawFooter(page, font, width, periodoName);
    return pdfDoc.save();
  }

  private drawHeader(
    page: PDFPage,
    fontBold: PDFFont,
    font: PDFFont,
    width: number,
    yPos: number,
    periodoName: string,
  ): number {
    page.drawText('Universidad Nacional de Trujillo', {
      x: width / 2 - fontBold.widthOfTextAtSize('Universidad Nacional de Trujillo', 12) / 2,
      y: yPos,
      size: 12,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.37),
    });
    yPos -= 14;

    const subtitle = 'Escuela Profesional de Ingenieria de Sistemas';
    page.drawText(subtitle, {
      x: width / 2 - font.widthOfTextAtSize(subtitle, 9) / 2,
      y: yPos,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 18;

    const title = `Reporte de Carga Docente — ${periodoName}`;
    page.drawText(title, {
      x: width / 2 - fontBold.widthOfTextAtSize(title, 11) / 2,
      y: yPos,
      size: 11,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.37),
    });
    yPos -= 20;

    return yPos;
  }

  private drawTableHeader(
    page: PDFPage,
    _font: PDFFont,
    fontBold: PDFFont,
    width: number,
    yPos: number,
  ): number {
    const cols = this.getColumns(width);
    const headerHeight = 18;

    page.drawRectangle({
      x: cols[0].x - 4,
      y: yPos - headerHeight + 4,
      width: width - 80,
      height: headerHeight,
      color: rgb(0.12, 0.23, 0.37),
    });

    const headers = ['Docente', 'Categoria', 'Regimen', 'H. Asig.', 'H. Max.', '% Carga', 'Cursos Asignados'];
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i], {
        x: cols[i].x,
        y: yPos - headerHeight + 8,
        size: 7,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }

    return yPos - headerHeight - 2;
  }

  private drawRow(
    page: PDFPage,
    font: PDFFont,
    row: CargaDocentePdfRow,
    width: number,
    yPos: number,
  ): number {
    const cols = this.getColumns(width);
    const rowHeight = 16;

    if (row.porcentaje >= 90) {
      page.drawRectangle({
        x: cols[0].x - 4,
        y: yPos - rowHeight + 4,
        width: width - 80,
        height: rowHeight,
        color: rgb(1.0, 0.93, 0.93),
      });
    } else if (row.horasAsignadas === 0) {
      page.drawRectangle({
        x: cols[0].x - 4,
        y: yPos - rowHeight + 4,
        width: width - 80,
        height: rowHeight,
        color: rgb(1.0, 0.99, 0.93),
      });
    }

    const textColor = rgb(0.15, 0.15, 0.15);
    const fontSize = 6.5;

    const values = [
      this.truncate(row.nombre, cols[0].w, font, fontSize),
      row.categoria,
      this.truncate(row.regimen, cols[2].w, font, fontSize),
      String(row.horasAsignadas),
      String(row.horasMaximas),
      `${row.porcentaje}%`,
      this.truncate(row.cursos || 'Sin asignaciones', cols[6].w, font, fontSize),
    ];

    for (let i = 0; i < values.length; i++) {
      page.drawText(values[i], {
        x: cols[i].x,
        y: yPos - rowHeight + 8,
        size: fontSize,
        font,
        color: textColor,
      });
    }

    page.drawLine({
      start: { x: cols[0].x - 4, y: yPos - rowHeight + 4 },
      end: { x: width - 40, y: yPos - rowHeight + 4 },
      thickness: 0.3,
      color: rgb(0.85, 0.85, 0.85),
    });

    return yPos - rowHeight;
  }

  private drawFooter(page: PDFPage, font: PDFFont, width: number, periodoName: string): void {
    const dateStr = `Generado: ${new Date().toLocaleDateString('es-PE')} — ${periodoName}`;
    page.drawText(dateStr, {
      x: width / 2 - font.widthOfTextAtSize(dateStr, 7) / 2,
      y: 25,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  private getColumns(width: number): { x: number; w: number }[] {
    const startX = 44;
    const totalW = width - 88;
    const widths = [0.18, 0.10, 0.12, 0.07, 0.07, 0.07, 0.39];
    let x = startX;
    return widths.map((pct) => {
      const w = totalW * pct;
      const col = { x, w };
      x += w;
      return col;
    });
  }

  private truncate(text: string, maxWidth: number, font: PDFFont, fontSize: number): string {
    if (font.widthOfTextAtSize(text, fontSize) <= maxWidth - 4) return text;
    let truncated = text;
    while (truncated.length > 0 && font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth - 4) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }
}
