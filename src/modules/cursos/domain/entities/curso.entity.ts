export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  ciclo: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X';
  tipo: 'Teórico' | 'Práctico' | 'Teórico-Práctico';
  horasTeoricas: number;
  horasPracticas: number;
  creditos: number;
  requiereLaboratorio: boolean;
  tipoLaboratorio: string | null;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
  updatedAt: string;
}
