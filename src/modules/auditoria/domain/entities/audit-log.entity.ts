export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  modulo: string;
  accion: string;
  entidadId?: string | null;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  descripcion?: string | null;
  createdAt: string;
}
