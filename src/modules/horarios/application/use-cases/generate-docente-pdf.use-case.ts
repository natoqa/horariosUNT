import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface DocentePdfAsignacion {
  grupoId: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: string;
}

export interface DocentePdfNameMaps {
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
  aula: string;
  ciclo: string;
}

export class GenerateDocentePdfUseCase {
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
    asignaciones: DocentePdfAsignacion[],
    nameMaps: DocentePdfNameMaps,
    periodoName: string,
    docenteName: string,
    actividadesNoLectivas?: Array<{
      tipo: string;
      horas: number;
      detalles: string;
      dia?: string;
      bloque?: string;
    }>,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    let yPos = height - 40;
    yPos = this.drawHeader(page, fontBold, font, width, yPos, periodoName, docenteName);
    yPos -= 10;
    this.drawGrid(page, font, fontBold, asignaciones, nameMaps, width, yPos, actividadesNoLectivas);
    this.drawFooter(page, font, width, periodoName);

    this.drawSummaryTable(pdfDoc, font, fontBold, width, height, asignaciones, nameMaps, periodoName, docenteName);

    return pdfDoc.save();
  }

  private drawHeader(
    page: PDFPage,
    fontBold: PDFFont,
    font: PDFFont,
    width: number,
    yPos: number,
    periodoName: string,
    docenteName: string,
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
    page.drawText(`Periodo: ${periodoName}`, {
      x: 50,
      y: yPos,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    const docenteLabel = `Docente: ${docenteName}`;
    const docenteWidth = fontBold.widthOfTextAtSize(docenteLabel, 9);
    page.drawText(docenteLabel, {
      x: width - 50 - docenteWidth,
      y: yPos,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.6),
    });

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
    asignaciones: DocentePdfAsignacion[],
    nameMaps: DocentePdfNameMaps,
    pageWidth: number,
    startY: number,
    actividadesNoLectivas?: Array<{
      tipo: string;
      horas: number;
      detalles: string;
      dia?: string;
      bloque?: string;
    }>,
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

        const cellActividades = actividadesNoLectivas?.filter(
          (act: { dia?: string; bloque?: string }) => act.dia === dia && act.bloque === bloque,
        ) ?? [];

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
          const truncatedAula = this.truncate(cell.aula, 14);

          page.drawText(truncatedCurso, {
            x: cellX + 3,
            y: rowY - 12,
            size: 6,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.1),
          });

          page.drawText(truncatedAula, {
            x: cellX + 3,
            y: rowY - 22,
            size: 5.5,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        for (const act of cellActividades) {
          const offset = cellAsignaciones.length * 20;
          const yOffset = rowY - 12 - offset;

          if (yOffset < rowY - rowHeight + 5) continue;

          page.drawRectangle({
            x: cellX + 1,
            y: yOffset - 12,
            width: dayColWidth - 2,
            height: 14,
            color: rgb(1.0, 0.96, 0.93),
          });

          const truncatedTipo = this.truncate(act.tipo, 18);
          page.drawText(truncatedTipo, {
            x: cellX + 3,
            y: yOffset - 8,
            size: 5.5,
            font: fontBold,
            color: rgb(0.8, 0.4, 0.1),
          });

          page.drawText(`${act.horas}h · No lectiva`, {
            x: cellX + 3,
            y: yOffset - 14,
            size: 5,
            font,
            color: rgb(0.6, 0.3, 0.1),
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
    asignaciones: DocentePdfAsignacion[],
    nameMaps: DocentePdfNameMaps,
    periodoName: string,
    docenteName: string,
  ): void {
    const ALL_CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Electivo', 'Sin Ciclo'];
    
    // Group by ciclo
    const rowsByCiclo = new Map<string, string[]>();
    for (const a of asignaciones) {
      if (!a.grupoId) continue;
      const ciclo = nameMaps.grupoCiclos.get(a.grupoId) || 'Sin Ciclo';
      
      if (!rowsByCiclo.has(ciclo)) {
        rowsByCiclo.set(ciclo, []);
      }
      
      const cicloRows = rowsByCiclo.get(ciclo)!;
      if (!cicloRows.includes(a.grupoId)) {
        cicloRows.push(a.grupoId);
      }
    }

    if (rowsByCiclo.size === 0) return;

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
    let page: PDFPage;

    const escuela = nameMaps.docenteEscuelas.values().next().value ?? '';

    const addNewPage = (ciclo: string) => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - margin;

      page.drawText(`Resumen de Carga Docente - Ciclo ${ciclo}`, {
        x: margin,
        y: yPos,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      yPos -= 20;

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

    const orderedCiclos = ALL_CICLOS.filter(c => rowsByCiclo.has(c));
    for (const c of rowsByCiclo.keys()) {
      if (!orderedCiclos.includes(c)) orderedCiclos.push(c);
    }

    for (const ciclo of orderedCiclos) {
      const rows = rowsByCiclo.get(ciclo)!;
      // Sort by Curso Name
      rows.sort((a, b) => {
        const nameA = nameMaps.cursos.get(a) ?? '';
        const nameB = nameMaps.cursos.get(b) ?? '';
        return nameA.localeCompare(nameB);
      });

      addNewPage(ciclo);

      for (let i = 0; i < rows.length; i++) {
        const grupoId = rows[i];
        if (yPos - rowHeight < margin) {
          this.drawFooter(page, font, pageWidth, periodoName);
          addNewPage(ciclo);
        }

        const cursoName = nameMaps.cursos.get(grupoId) ?? '';
        const cursoId = nameMaps.grupoCursoId.get(grupoId) ?? '';
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

    const rightText = `Horario Individual - ${periodoName}`;
    const rightWidth = font.widthOfTextAtSize(rightText, 7);
    page.drawText(rightText, {
      x: width - 50 - rightWidth,
      y: 25,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  private buildCellData(asig: DocentePdfAsignacion, nameMaps: DocentePdfNameMaps): CellData {
    return {
      curso: nameMaps.cursos.get(asig.grupoId) ?? 'Curso',
      aula: nameMaps.aulas.get(asig.aulaId) ?? 'Aula',
      ciclo: nameMaps.grupoCiclos.get(asig.grupoId) ?? '',
    };
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen - 1) + '…';
  }
}
