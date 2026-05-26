import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface OcupacionAulaPdfSlot {
  dia: DiaSemana;
  bloque: BloqueHorario;
  curso: string;
  docente: string;
}

export class GenerateOcupacionAulasPdfUseCase {
  async execute(
    aulaName: string,
    slots: OcupacionAulaPdfSlot[],
    porcentaje: number,
    periodoName: string,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([842, 595]);
    const { width } = page.getSize();

    let yPos = 555;
    yPos = this.drawHeader(page, fontBold, font, width, yPos, aulaName, porcentaje, periodoName);
    yPos -= 8;
    this.drawGrid(page, font, fontBold, slots, width, yPos);
    this.drawFooter(page, font, width, periodoName);

    return pdfDoc.save();
  }

  private drawHeader(
    page: PDFPage,
    fontBold: PDFFont,
    font: PDFFont,
    width: number,
    yPos: number,
    aulaName: string,
    porcentaje: number,
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

    const title = `Ocupacion de Aula: ${aulaName} — ${periodoName}`;
    page.drawText(title, {
      x: width / 2 - fontBold.widthOfTextAtSize(title, 11) / 2,
      y: yPos,
      size: 11,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.37),
    });
    yPos -= 14;

    const occText = `Ocupacion: ${porcentaje}%`;
    page.drawText(occText, {
      x: width / 2 - font.widthOfTextAtSize(occText, 9) / 2,
      y: yPos,
      size: 9,
      font,
      color: porcentaje >= 80 ? rgb(0.7, 0.1, 0.1) : rgb(0.3, 0.3, 0.3),
    });
    yPos -= 16;

    return yPos;
  }

  private drawGrid(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    slots: OcupacionAulaPdfSlot[],
    width: number,
    yPos: number,
  ): void {
    const marginLeft = 44;
    const marginRight = 40;
    const tableWidth = width - marginLeft - marginRight;
    const timeColWidth = 80;
    const dayColWidth = (tableWidth - timeColWidth) / DIAS_SEMANA.length;
    const rowHeight = 28;
    const headerHeight = 18;

    const slotMap = new Map<string, OcupacionAulaPdfSlot>();
    for (const s of slots) {
      slotMap.set(`${s.dia}||${s.bloque}`, s);
    }

    page.drawRectangle({
      x: marginLeft,
      y: yPos - headerHeight,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.12, 0.23, 0.37),
    });

    page.drawText('Horario', {
      x: marginLeft + 4,
      y: yPos - headerHeight + 5,
      size: 7,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    for (let i = 0; i < DIAS_SEMANA.length; i++) {
      const x = marginLeft + timeColWidth + i * dayColWidth;
      const label = DIAS_SEMANA[i];
      const labelWidth = fontBold.widthOfTextAtSize(label, 7);
      page.drawText(label, {
        x: x + (dayColWidth - labelWidth) / 2,
        y: yPos - headerHeight + 5,
        size: 7,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }

    let currentY = yPos - headerHeight;

    for (const bloque of BLOQUES_HORARIOS) {
      currentY -= rowHeight;

      page.drawText(bloque, {
        x: marginLeft + 4,
        y: currentY + rowHeight / 2 - 3,
        size: 6,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      for (let i = 0; i < DIAS_SEMANA.length; i++) {
        const dia = DIAS_SEMANA[i];
        const x = marginLeft + timeColWidth + i * dayColWidth;
        const slot = slotMap.get(`${dia}||${bloque}`);

        if (slot) {
          page.drawRectangle({
            x: x + 1,
            y: currentY + 1,
            width: dayColWidth - 2,
            height: rowHeight - 2,
            color: rgb(0.93, 0.95, 1.0),
          });

          const cursoTrunc = this.truncate(slot.curso, dayColWidth - 6, font, 5.5);
          page.drawText(cursoTrunc, {
            x: x + 3,
            y: currentY + rowHeight - 9,
            size: 5.5,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.1),
          });

          const docenteTrunc = this.truncate(slot.docente, dayColWidth - 6, font, 5);
          page.drawText(docenteTrunc, {
            x: x + 3,
            y: currentY + rowHeight - 18,
            size: 5,
            font,
            color: rgb(0.35, 0.35, 0.35),
          });
        } else {
          page.drawRectangle({
            x: x + 1,
            y: currentY + 1,
            width: dayColWidth - 2,
            height: rowHeight - 2,
            color: rgb(0.96, 0.96, 0.96),
          });
        }
      }

      page.drawLine({
        start: { x: marginLeft, y: currentY },
        end: { x: marginLeft + tableWidth, y: currentY },
        thickness: 0.3,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

    page.drawRectangle({
      x: marginLeft,
      y: currentY,
      width: tableWidth,
      height: yPos - currentY,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    });
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

  private truncate(text: string, maxWidth: number, font: PDFFont, fontSize: number): string {
    if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
    let t = text;
    while (t.length > 0 && font.widthOfTextAtSize(t + '...', fontSize) > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + '...';
  }
}
