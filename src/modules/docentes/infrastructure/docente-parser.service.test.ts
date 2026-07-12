import { describe, it, expect } from 'vitest';
import { DocenteParserService } from './docente-parser.service';
import * as fs from 'fs';
import * as path from 'path';

describe('DocenteParserService', () => {
  const parser = new DocenteParserService();

  it('debe parsear correctamente el archivo de prueba docentes_prueba.csv (con columna id)', async () => {
    const csvPath = path.join(process.cwd(), 'datos-prueba', 'docentes_prueba.csv');
    const buffer = fs.readFileSync(csvPath);

    const docentes = await parser.extraerDocentesDesdeCsv(buffer);

    expect(docentes).toBeDefined();
    expect(docentes.length).toBe(15);

    // Verificar el primer docente: Juan Pérez
    const juan = docentes[0];
    expect(juan.nombres).toBe('Juan');
    expect(juan.apellidos).toBe('Pérez');
    expect(juan.dni).toBe('12345678');
    expect(juan.correo).toBe('juan.perez@unt.edu.pe');
    expect(juan.telefono).toBe('987654321');
    expect(juan.categoria).toBe('Principal');
    expect(juan.regimen).toBe('Dedicación Exclusiva');
    expect(juan.condicion).toBe('Nombrado');
    expect(juan.escuela).toBe('Ingeniería de Sistemas');
    expect(juan.fechaIngreso).toBe('2015-03-15');
    expect(juan.cargaMaxima).toBe(40);
    expect(juan.estado).toBe('Activo');
  });

  it('debe parsear correctamente un formato estándar sin columna id', async () => {
    const csvContent = [
      'NOMBRES,APELLIDOS,DNI,CORREO,TELÉFONO,CATEGORÍA,RÉGIMEN,CONDICIÓN,ESCUELA,FECHA INGRESO,CARGA MÁXIMA,CARGA ELECTIVA,ESTADO',
      'Ana,Martínez,34567890,ana.martinez@unt.edu.pe,987654324,Principal,Dedicación Exclusiva,Nombrado,Economía,2012-02-28,40,0,Activo'
    ].join('\n');
    
    const buffer = Buffer.from(csvContent, 'utf-8');
    const docentes = await parser.extraerDocentesDesdeCsv(buffer);

    expect(docentes.length).toBe(1);
    const ana = docentes[0];
    expect(ana.nombres).toBe('Ana');
    expect(ana.apellidos).toBe('Martínez');
    expect(ana.dni).toBe('34567890');
    expect(ana.correo).toBe('ana.martinez@unt.edu.pe');
  });
});
