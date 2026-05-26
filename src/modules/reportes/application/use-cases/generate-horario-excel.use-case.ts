import ExcelJS from 'exceljs';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { CICLOS } from '../../domain/entities/report-config.entity';

export interface ExcelAsignacion {
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: string;
}

export interface ExcelDocenteInfo {
  id: string;
  nombre: string;
  categoria: string;
  regimen: string;
  cargaMaxima: number;
}

export interface ExcelAulaInfo {
  id: string;
  nombre: string;
}

export interface ExcelNameMaps {
  docentes: Map<string, string>;
  cursos: Map<string, string>;
  aulas: Map<string, string>;
  grupoCiclos: Map<string, string>;
}

const HEADER_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 10,
};

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

export class GenerateHorarioExcelUseCase {
  async execute(
    asignaciones: ExcelAsignacion[],
    nameMaps: ExcelNameMaps,
    docenteInfos: ExcelDocenteInfo[],
    aulaInfos: ExcelAulaInfo[],
    periodoName: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Horarios UNT';
    workbook.created = new Date();

    for (const ciclo of CICLOS) {
      const cicloAsignaciones = asignaciones.filter(
        (a) => nameMaps.grupoCiclos.get(a.grupoId) === ciclo,
      );

      if (cicloAsignaciones.length === 0) continue;
      this.buildCicloSheet(workbook, ciclo, cicloAsignaciones, nameMaps, periodoName);
    }

    this.buildCargaDocenteSheet(workbook, asignaciones, docenteInfos, nameMaps, periodoName);
    this.buildOcupacionAulasSheet(workbook, asignaciones, aulaInfos, periodoName);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildCicloSheet(
    workbook: ExcelJS.Workbook,
    ciclo: string,
    asignaciones: ExcelAsignacion[],
    nameMaps: ExcelNameMaps,
    periodoName: string,
  ): void {
    const sheet = workbook.addWorksheet(`Ciclo ${ciclo}`);

    sheet.mergeCells('A1', 'G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Horario Ciclo ${ciclo} — ${periodoName}`;
    titleCell.font = { bold: true, size: 12 };
    titleCell.alignment = { horizontal: 'center' };

    const headerRow = sheet.addRow(['Hora', ...DIAS_SEMANA]);
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = BORDER_STYLE;
    });

    sheet.getColumn(1).width = 14;
    for (let i = 2; i <= 7; i++) {
      sheet.getColumn(i).width = 22;
    }

    for (const bloque of BLOQUES_HORARIOS) {
      const rowData: string[] = [bloque];

      for (const dia of DIAS_SEMANA) {
        const matches = asignaciones.filter(
          (a) => a.dia === dia && a.bloque === bloque,
        );

        if (matches.length === 0) {
          rowData.push('');
        } else {
          const cellTexts = matches.map((m) => {
            const curso = nameMaps.cursos.get(m.grupoId) ?? '';
            const docente = nameMaps.docentes.get(m.docenteId) ?? '';
            const aula = nameMaps.aulas.get(m.aulaId) ?? '';
            return `${curso}\n${docente}\n${aula}`;
          });
          rowData.push(cellTexts.join('\n---\n'));
        }
      }

      const row = sheet.addRow(rowData);
      row.height = 42;
      row.eachCell((cell) => {
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.font = { size: 8 };
      });
    }
  }

  private buildCargaDocenteSheet(
    workbook: ExcelJS.Workbook,
    asignaciones: ExcelAsignacion[],
    docenteInfos: ExcelDocenteInfo[],
    nameMaps: ExcelNameMaps,
    periodoName: string,
  ): void {
    const sheet = workbook.addWorksheet('Carga Docente');

    sheet.mergeCells('A1', 'G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Carga Docente — ${periodoName}`;
    titleCell.font = { bold: true, size: 12 };

    const headerRow = sheet.addRow([
      'Docente',
      'Categoria',
      'Regimen',
      'Horas Asignadas',
      'Horas Maximas',
      '% Carga',
      'Cursos Asignados',
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'center' };
      cell.border = BORDER_STYLE;
    });

    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 14;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 16;
    sheet.getColumn(5).width = 16;
    sheet.getColumn(6).width = 12;
    sheet.getColumn(7).width = 40;

    const horasPorDocente = new Map<string, number>();
    const cursosPorDocente = new Map<string, Set<string>>();
    for (const a of asignaciones) {
      horasPorDocente.set(a.docenteId, (horasPorDocente.get(a.docenteId) ?? 0) + 1);

      const cursoName = nameMaps.cursos.get(a.grupoId) ?? '';
      if (!cursosPorDocente.has(a.docenteId)) {
        cursosPorDocente.set(a.docenteId, new Set());
      }
      if (cursoName) cursosPorDocente.get(a.docenteId)!.add(cursoName);
    }

    for (const docente of docenteInfos) {
      const horas = horasPorDocente.get(docente.id) ?? 0;
      const porcentaje = docente.cargaMaxima > 0
        ? Math.round((horas / docente.cargaMaxima) * 100)
        : 0;
      const cursosSet = cursosPorDocente.get(docente.id);
      const cursosStr = cursosSet ? Array.from(cursosSet).join(', ') : '';

      const row = sheet.addRow([
        docente.nombre,
        docente.categoria,
        docente.regimen,
        horas,
        docente.cargaMaxima,
        `${porcentaje}%`,
        cursosStr,
      ]);

      row.eachCell((cell) => {
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });

      if (porcentaje >= 90) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        });
      } else if (horas === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
        });
      }
    }
  }

  private buildOcupacionAulasSheet(
    workbook: ExcelJS.Workbook,
    asignaciones: ExcelAsignacion[],
    aulaInfos: ExcelAulaInfo[],
    periodoName: string,
  ): void {
    const sheet = workbook.addWorksheet('Ocupacion Aulas');

    sheet.mergeCells('A1', 'D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Ocupacion de Aulas — ${periodoName}`;
    titleCell.font = { bold: true, size: 12 };

    const totalSlots = DIAS_SEMANA.length * BLOQUES_HORARIOS.length;

    const headerRow = sheet.addRow([
      'Aula',
      'Bloques Ocupados',
      `Total Bloques (${totalSlots})`,
      '% Ocupación',
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'center' };
      cell.border = BORDER_STYLE;
    });

    sheet.getColumn(1).width = 24;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 14;

    const bloquesPorAula = new Map<string, number>();
    for (const a of asignaciones) {
      bloquesPorAula.set(a.aulaId, (bloquesPorAula.get(a.aulaId) ?? 0) + 1);
    }

    for (const aula of aulaInfos) {
      const ocupados = bloquesPorAula.get(aula.id) ?? 0;
      const porcentaje = Math.round((ocupados / totalSlots) * 100);

      const row = sheet.addRow([
        aula.nombre,
        ocupados,
        totalSlots,
        `${porcentaje}%`,
      ]);

      row.eachCell((cell) => {
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'middle' };
      });
    }
  }
}
