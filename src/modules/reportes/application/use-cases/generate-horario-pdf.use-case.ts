import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { ReportConfig } from '../../domain/entities/report-config.entity';

export interface PdfAsignacion {
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: string;
}

export interface PdfNameMaps {
  docentes: Map<string, string>;
  cursos: Map<string, string>;
  aulas: Map<string, string>;
  grupoCiclos: Map<string, string>;
  docenteEscuelas: Map<string, string>;
  cursoCreditos: Map<string, number>;
  cursoHoras: Map<string, number>;
  grupoCursoId: Map<string, string>;
}

interface CellData {
  curso: string;
  docente: string;
  aula: string;
  ciclo: string;
}

export class GenerateHorarioPdfUseCase {
  private getCourseColor(cursoName: string): { r: number, g: number, b: number } {
    const pastelColors = [
      { r: 0.93, g: 0.95, b: 1.0 }, { r: 0.93, g: 1.0, b: 0.95 },
      { r: 1.0, g: 0.97, b: 0.93 }, { r: 0.96, g: 0.93, b: 1.0 },
      { r: 1.0, g: 0.93, b: 0.95 }, { r: 0.93, g: 0.99, b: 1.0 },
      { r: 1.0, g: 0.96, b: 0.93 }, { r: 0.94, g: 0.94, b: 1.0 },
      { r: 0.93, g: 0.98, b: 0.97 }, { r: 1.0, g: 0.93, b: 0.96 },
      { r: 0.98, g: 0.98, b: 0.88 }, { r: 0.88, g: 0.98, b: 0.88 },
    ];
    let hash = 0;
    for (let i = 0; i < cursoName.length; i++) {
      hash = cursoName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
  }
  async execute(
    asignaciones: PdfAsignacion[],
    nameMaps: PdfNameMaps,
    config: ReportConfig,
    filterLabel: string,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    if (config.filterType === 'all') {
      const ALL_CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Electivo', 'Sin Ciclo'];
      const asignacionesByCiclo = new Map<string, PdfAsignacion[]>();
      
      for (const a of asignaciones) {
        const ciclo = nameMaps.grupoCiclos.get(a.grupoId) || 'Sin Ciclo';
        if (!asignacionesByCiclo.has(ciclo)) {
          asignacionesByCiclo.set(ciclo, []);
        }
        asignacionesByCiclo.get(ciclo)!.push(a);
      }

      const orderedCiclos = ALL_CICLOS.filter(c => asignacionesByCiclo.has(c));
      for (const c of asignacionesByCiclo.keys()) {
        if (!orderedCiclos.includes(c)) orderedCiclos.push(c);
      }

      for (const ciclo of orderedCiclos) {
        const page = pdfDoc.addPage([842, 595]); // A4 landscape
        const { width, height } = page.getSize();
        let yPos = height - 40;
        
        yPos = this.drawHeader(page, fontBold, font, width, yPos, config, `Horario - Ciclo ${ciclo}`);
        yPos -= 10;
        
        const cicloAsig = asignacionesByCiclo.get(ciclo)!;
        this.drawGrid(page, font, fontBold, cicloAsig, nameMaps, width, yPos);
        this.drawFooter(page, font, width, config.periodoName);

        this.drawSummaryTable(pdfDoc, font, fontBold, width, height, cicloAsig, nameMaps, config.periodoName, ` - Ciclo ${ciclo}`);
      }
    } else {
      const page = pdfDoc.addPage([842, 595]); // A4 landscape
      const { width, height } = page.getSize();
      let yPos = height - 40;
      yPos = this.drawHeader(page, fontBold, font, width, yPos, config, filterLabel);
      yPos -= 10;
      this.drawGrid(page, font, fontBold, asignaciones, nameMaps, width, yPos);
      this.drawFooter(page, font, width, config.periodoName);
      
      this.drawSummaryTable(pdfDoc, font, fontBold, width, height, asignaciones, nameMaps, config.periodoName, '');
    }

    return pdfDoc.save();
  }

  private drawHeader(
    page: PDFPage,
    fontBold: PDFFont,
    font: PDFFont,
    width: number,
    yPos: number,
    config: ReportConfig,
    filterLabel: string,
  ): number {
    page.drawText('Universidad Nacional de Trujillo', {
      x: 50,
      y: yPos,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPos -= 16;
    page.drawText('Escuela Profesional de Ingenieria de Sistemas', {
      x: 50,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPos -= 14;
    page.drawText(`Periodo: ${config.periodoName}`, {
      x: 50,
      y: yPos,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    if (filterLabel) {
      const filterText = `Filtro: ${filterLabel}`;
      const filterWidth = fontBold.widthOfTextAtSize(filterText, 9);
      page.drawText(filterText, {
        x: width - 50 - filterWidth,
        y: yPos,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.6),
      });
    }

    yPos -= 8;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    return yPos;
  }

  private drawGrid(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    asignaciones: PdfAsignacion[],
    nameMaps: PdfNameMaps,
    pageWidth: number,
    startY: number,
  ): void {
    const marginLeft = 50;
    const marginRight = 50;
    const tableWidth = pageWidth - marginLeft - marginRight;
    const timeColWidth = 80;
    const dayColWidth = (tableWidth - timeColWidth) / DIAS_SEMANA.length;
    const headerHeight = 20;
    const rowHeight = 32;

    let y = startY;

    // Header row
    page.drawRectangle({
      x: marginLeft,
      y: y - headerHeight,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText('Hora', {
      x: marginLeft + 4,
      y: y - 14,
      size: 7,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    for (let i = 0; i < DIAS_SEMANA.length; i++) {
      const x = marginLeft + timeColWidth + i * dayColWidth;
      page.drawText(DIAS_SEMANA[i], {
        x: x + 4,
        y: y - 14,
        size: 7,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawLine({
        start: { x, y },
        end: { x, y: y - headerHeight - BLOQUES_HORARIOS.length * rowHeight },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

    y -= headerHeight;

    // Data rows
    for (let r = 0; r < BLOQUES_HORARIOS.length; r++) {
      const bloque = BLOQUES_HORARIOS[r];
      const rowY = y - r * rowHeight;

      if (r % 2 === 0) {
        page.drawRectangle({
          x: marginLeft,
          y: rowY - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      page.drawText(bloque, {
        x: marginLeft + 4,
        y: rowY - 12,
        size: 6,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawLine({
        start: { x: marginLeft, y: rowY - rowHeight },
        end: { x: marginLeft + tableWidth, y: rowY - rowHeight },
        thickness: 0.3,
        color: rgb(0.85, 0.85, 0.85),
      });

      for (let d = 0; d < DIAS_SEMANA.length; d++) {
        const dia = DIAS_SEMANA[d];
        const cellX = marginLeft + timeColWidth + d * dayColWidth;
        const cellAsignaciones = asignaciones.filter(
          (a) => a.dia === dia && a.bloque === bloque,
        );

        for (const asig of cellAsignaciones) {
          const cell = this.buildCellData(asig, nameMaps);
          const cursoColor = this.getCourseColor(cell.curso);

          page.drawRectangle({
            x: cellX + 1,
            y: rowY - rowHeight + 1,
            width: dayColWidth - 2,
            height: rowHeight - 2,
            color: rgb(cursoColor.r, cursoColor.g, cursoColor.b),
          });

          const truncatedCurso = this.truncate(cell.curso, 18);
          const truncatedDocente = this.truncate(cell.docente, 18);
          const truncatedAula = this.truncate(cell.aula, 14);

          page.drawText(truncatedCurso, {
            x: cellX + 3,
            y: rowY - 10,
            size: 5.5,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.1),
          });

          page.drawText(truncatedDocente, {
            x: cellX + 3,
            y: rowY - 18,
            size: 5,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });

          page.drawText(truncatedAula, {
            x: cellX + 3,
            y: rowY - 25,
            size: 5,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }
    }

    // Table border
    const tableHeight = headerHeight + BLOQUES_HORARIOS.length * rowHeight;
    page.drawRectangle({
      x: marginLeft,
      y: startY - tableHeight,
      width: tableWidth,
      height: tableHeight,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    });
  }

  private drawSummaryTable(
    pdfDoc: PDFDocument,
    font: PDFFont,
    fontBold: PDFFont,
    pageWidth: number,
    pageHeight: number,
    asignaciones: PdfAsignacion[],
    nameMaps: PdfNameMaps,
    periodoName: string,
    titleSuffix: string,
  ): void {
    const summaryRows = new Map<string, { docenteId: string, grupoId: string }>();
    
    for (const a of asignaciones) {
      if (!a.docenteId || !a.grupoId) continue;
      const key = `${a.docenteId}-${a.grupoId}`;
      if (!summaryRows.has(key)) {
        summaryRows.set(key, { docenteId: a.docenteId, grupoId: a.grupoId });
      }
    }

    if (summaryRows.size === 0) return;

    const rows = Array.from(summaryRows.values());
    rows.sort((a, b) => {
      const nameA = nameMaps.docentes.get(a.docenteId) ?? '';
      const nameB = nameMaps.docentes.get(b.docenteId) ?? '';
      return nameA.localeCompare(nameB);
    });

    const margin = 50;
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = [
      tableWidth * 0.25,
      tableWidth * 0.20,
      tableWidth * 0.35,
      tableWidth * 0.10,
      tableWidth * 0.10,
    ];
    const rowHeight = 24;
    let yPos = 0;
    let page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - margin;

      page.drawText(`Resumen de Carga Docente${titleSuffix}`, {
        x: margin,
        y: yPos,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      yPos -= 20;

      // Draw header
      page.drawRectangle({
        x: margin,
        y: yPos - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.9, 0.9, 0.9),
      });

      const headers = ['Docente', 'Escuela', 'Curso', 'Créditos', 'Horas'];
      let currentX = margin;
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: currentX + 4,
          y: yPos - 16,
          size: 9,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentX += colWidths[i];
      }
      yPos -= rowHeight;
    };

    addNewPage();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (yPos - rowHeight < margin) {
        this.drawFooter(page, font, pageWidth, periodoName);
        addNewPage();
      }

      const docenteName = nameMaps.docentes.get(row.docenteId) ?? '';
      const escuela = nameMaps.docenteEscuelas.get(row.docenteId) ?? '';
      const cursoName = nameMaps.cursos.get(row.grupoId) ?? '';
      
      const cursoId = nameMaps.grupoCursoId.get(row.grupoId) ?? '';
      const creditos = nameMaps.cursoCreditos.get(cursoId)?.toString() ?? '0';
      const horas = nameMaps.cursoHoras.get(cursoId)?.toString() ?? '0';

      const rowTexts = [
        this.truncate(docenteName, 35),
        this.truncate(escuela, 30),
        this.truncate(cursoName, 55),
        creditos,
        horas,
      ];

      let currentX = margin;
      for (let j = 0; j < rowTexts.length; j++) {
        page.drawText(rowTexts[j], {
          x: currentX + 4,
          y: yPos - 16,
          size: 8,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        
        page.drawLine({
          start: { x: currentX, y: yPos },
          end: { x: currentX, y: yPos - rowHeight },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        currentX += colWidths[j];
      }
      
      page.drawLine({
        start: { x: currentX, y: yPos },
        end: { x: currentX, y: yPos - rowHeight },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });

      page.drawLine({
        start: { x: margin, y: yPos - rowHeight },
        end: { x: margin + tableWidth, y: yPos - rowHeight },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });

      yPos -= rowHeight;
    }
    
    this.drawFooter(page, font, pageWidth, periodoName);
  }

  private drawFooter(page: PDFPage, font: PDFFont, width: number, periodoName: string): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    page.drawText(`Generado: ${dateStr}`, {
      x: 50,
      y: 25,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const rightText = `Horarios UNT - ${periodoName}`;
    const rightWidth = font.widthOfTextAtSize(rightText, 7);
    page.drawText(rightText, {
      x: width - 50 - rightWidth,
      y: 25,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  private buildCellData(asig: PdfAsignacion, nameMaps: PdfNameMaps): CellData {
    return {
      curso: nameMaps.cursos.get(asig.grupoId) ?? 'Curso',
      docente: nameMaps.docentes.get(asig.docenteId) ?? 'Docente',
      aula: nameMaps.aulas.get(asig.aulaId) ?? 'Aula',
      ciclo: nameMaps.grupoCiclos.get(asig.grupoId) ?? '',
    };
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen - 1) + '…';
  }
}
