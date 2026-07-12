import * as XLSX from 'xlsx';

export class PlantillaGeneratorService {
  generarPlantillaDocentes(formato: 'excel' | 'csv'): Buffer {
    const datos = [
      ['nombres', 'apellidos', 'dni', 'correo', 'telefono', 'categoria', 'regimen', 'condicion', 'escuela', 'fechaIngreso', 'cargaMaxima', 'cargaElectiva', 'estado'],
      ['Juan', 'Pérez García', '12345678', 'juan.perez@unt.edu.pe', '987654321', 'Principal', 'Dedicación Exclusiva', 'Nombrado', 'Ingeniería de Sistemas', '2018-03-15', '40', '20', 'Activo'],
      ['María', 'Rodríguez López', '87654321', 'maria.rodriguez@unt.edu.pe', '987654322', 'Asociado', 'Tiempo Completo', 'Contratado', 'Ingeniería Civil', '2020-06-01', '20', '15', 'Activo'],
    ];

    if (formato === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet(datos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Docentes');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    } else {
      const csv = datos.map(row => row.join(',')).join('\n');
      return Buffer.from(csv, 'utf-8');
    }
  }
}
