import * as XLSX from 'xlsx';

export class PlantillaGeneratorService {
  generarPlantillaCursos(formato: 'excel' | 'csv'): Buffer {
    const datos = [
      ['codigo', 'nombre', 'ciclo', 'horasTeoricas', 'horasPracticas', 'creditos'],
      ['CS101', 'Programación I', 'I', '4', '2', '6'],
      ['MAT202', 'Matemáticas II', 'II', '3', '3', '6'],
      ['FIS301', 'Física III', 'III', '2', '4', '6'],
    ];

    if (formato === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet(datos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cursos');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    } else {
      const csv = datos.map(row => row.join(',')).join('\n');
      return Buffer.from(csv, 'utf-8');
    }
  }
}
