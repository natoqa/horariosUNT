import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { ActividadNoLectiva, CargaNoLectiva } from '../../domain/entities/carga-no-lectiva.entity';

export class GenerateCargaNoLectivaPdfUseCase {
  async execute(
    docenteNombre: string,
    periodoName: string,
    carga: CargaNoLectiva,
    actividades: ActividadNoLectiva[],
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    let y = height - 60;
    page.drawText('Universidad Nacional de Trujillo', {
      x: 40,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.37),
    });
    y -= 22;
    page.drawText('Escuela Profesional de Ingeniería de Sistemas', {
      x: 40,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 24;

    page.drawText(`Declaración de Carga Horaria - ${periodoName}`, {
      x: 40,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.37),
    });
    y -= 30;

    const paragraphs = [
      `Docente: ${docenteNombre}`,
      `Periodo: ${periodoName}`,
      `Estado: ${carga.estado}`,
      `Carga lectiva asignada: ${carga.horasLectivasAsignadas} horas`,
      `Carga lectiva no asignada: ${carga.horasLectivasNoAsignadas} horas`,
      `Carga lectiva declarada: ${carga.lectivaDeclarada ? 'Sí' : 'No'}`,
      `Detalle de declaración lectiva: ${carga.declaracionLectiva}`,
      `Total horas declaradas: ${carga.totalHoras} horas`,
      ' ',
      'Actividades no lectivas registradas:',
    ];

    for (const paragraph of paragraphs) {
      page.drawText(paragraph, { x: 40, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
      y -= 16;
    }

    y -= 8;
    page.drawText('Tipo', { x: 40, y, size: 10, font: fontBold });
    page.drawText('Horas', { x: 280, y, size: 10, font: fontBold });
    page.drawText('Detalle', { x: 340, y, size: 10, font: fontBold });
    y -= 16;

    for (const actividad of actividades) {
      if (y < 80) {
        this.drawFooter(page, font, width, periodoName);
        y = height - 60;
      }

      page.drawText(actividad.tipo, { x: 40, y, size: 9, font, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(`${actividad.horas}`, { x: 280, y, size: 9, font, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(actividad.detalles, { x: 340, y, size: 9, font, color: rgb(0.15, 0.15, 0.15), maxWidth: 215 });
      y -= 16;
    }

    this.drawFooter(page, font, width, periodoName);
    return pdfDoc.save();
  }

  private drawFooter(page: PDFPage, font: PDFFont, width: number, periodoName: string) {
    const footerText = `Declaración de Carga No Lectiva — ${periodoName} — Generado el ${new Date().toLocaleDateString('es-PE')}`;
    page.drawText(footerText, {
      x: 40,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
}
