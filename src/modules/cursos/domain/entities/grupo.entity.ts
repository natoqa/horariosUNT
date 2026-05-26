export interface Grupo {
  id: string;
  cursoId: string;
  periodoId: string;
  docenteId: string | null;
  nombre: string;
  numEstudiantes: number;
  createdAt: string;
  updatedAt: string;
}
