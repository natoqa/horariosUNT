'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseAuditoriaRepository } from '../../infrastructure/supabase-auditoria.repository';
import { GetAuditLogsUseCase } from '../../application/use-cases/get-audit-logs.use-case';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import ExcelJS from 'exceljs';

interface ExportAuditoriaExcelResult {
  success?: boolean;
  message?: string;
  data?: Buffer;
}

export async function exportAuditoriaExcelAction(filters?: {
  userEmail?: string;
  modulo?: string;
  accion?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ExportAuditoriaExcelResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director') {
    return { message: 'No tiene permisos para exportar los logs de auditoría.' };
  }

  const repo = new SupabaseAuditoriaRepository();
  const useCase = new GetAuditLogsUseCase(repo);

  try {
    const logs = await useCase.execute(filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registro de Auditoría');

    // Estilos
    const headerStyle = {
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FF1E3A8A' },
      },
      font: {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11,
      },
      alignment: {
        horizontal: 'center' as const,
        vertical: 'middle' as const,
        wrapText: true,
      },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
      },
    };

    const cellStyle = {
      alignment: {
        vertical: 'middle' as const,
        wrapText: true,
      },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
      },
    };

    // Encabezados
    const headers = [
      'Fecha/Hora',
      'Usuario',
      'Rol',
      'Módulo',
      'Acción',
      'Descripción',
      'ID Entidad',
      'Datos Anteriores',
      'Datos Nuevos',
    ];

    worksheet.columns = [
      { key: 'fecha', width: 22 },
      { key: 'usuario', width: 25 },
      { key: 'rol', width: 12 },
      { key: 'modulo', width: 15 },
      { key: 'accion', width: 15 },
      { key: 'descripcion', width: 35 },
      { key: 'entidadId', width: 30 },
      { key: 'datosAnteriores', width: 40 },
      { key: 'datosNuevos', width: 40 },
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Datos
    logs.forEach((log) => {
      const row = worksheet.addRow([
        new Date(log.createdAt).toLocaleString('es-PE', { timeZone: 'America/Lima' }),
        log.userEmail,
        log.userRole,
        log.modulo,
        log.accion,
        log.descripcion || '-',
        log.entidadId || '-',
        log.datosAnteriores ? JSON.stringify(log.datosAnteriores, null, 2) : '-',
        log.datosNuevos ? JSON.stringify(log.datosNuevos, null, 2) : '-',
      ]);

      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
    });

    // Título del reporte
    worksheet.insertRow(1, ['REGISTRO DE AUDITORÍA - SISTEMA DE HORARIOS UNT']);
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
      },
      font: {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 14,
      },
      alignment: {
        horizontal: 'center' as const,
        vertical: 'middle' as const,
      },
    };
    worksheet.getRow(1).height = 30;

    // Filtros aplicados
    if (filters && Object.keys(filters).some((key) => filters[key as keyof typeof filters])) {
      const filterRow = worksheet.addRow(['Filtros aplicados:']);
      worksheet.mergeCells('A2:I2');
      const filterCell = worksheet.getCell('A2');
      filterCell.style = {
        font: {
          bold: true,
          size: 10,
          color: { argb: 'FF64748B' },
        },
        alignment: {
          horizontal: 'left' as const,
        },
      };

      const filterDetails = [];
      if (filters.userEmail) filterDetails.push(`Usuario: ${filters.userEmail}`);
      if (filters.modulo) filterDetails.push(`Módulo: ${filters.modulo}`);
      if (filters.accion) filterDetails.push(`Acción: ${filters.accion}`);
      if (filters.startDate) filterDetails.push(`Desde: ${filters.startDate}`);
      if (filters.endDate) filterDetails.push(`Hasta: ${filters.endDate}`);

      if (filterDetails.length > 0) {
        worksheet.addRow([filterDetails.join(' | ')]);
        worksheet.mergeCells('A3:I3');
        const filterDetailCell = worksheet.getCell('A3');
        filterDetailCell.style = {
          font: {
            size: 9,
            color: { argb: 'FF64748B' },
          },
          alignment: {
            horizontal: 'left' as const,
          },
        };
      }
    }

    // Pie de página
    const footerRow = worksheet.addRow([
      `Generado el ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })} | Sistema de Horarios UNT`,
    ]);
    worksheet.mergeCells(`A${worksheet.rowCount}:I${worksheet.rowCount}`);
    const footerCell = worksheet.getCell(`A${worksheet.rowCount}`);
    footerCell.style = {
      font: {
        size: 9,
        italic: true,
        color: { argb: 'FF64748B' },
      },
      alignment: {
        horizontal: 'center' as const,
      },
    };
    worksheet.getRow(worksheet.rowCount).height = 25;

    const buffer = await workbook.xlsx.writeBuffer();

    return { success: true, data: buffer as unknown as Buffer };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al exportar logs de auditoría.';
    return { message };
  }
}
