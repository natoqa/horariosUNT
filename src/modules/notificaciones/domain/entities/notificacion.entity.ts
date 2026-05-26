export interface Notificacion {
  id: string;
  destinatarioId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}
