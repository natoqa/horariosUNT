'use client';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { useState } from 'react';
import { Calendar, User, Database, Eye } from 'lucide-react';

interface AuditoriaTableProps {
  logs: AuditLog[];
}

export function AuditoriaTable({ logs }: AuditoriaTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getModuleBadgeColor = (modulo: string) => {
    switch (modulo) {
      case 'auth':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'periodos':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'docentes':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cursos':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'aulas':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'disponibilidad':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'horarios':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'auditoria':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionBadgeColor = (accion: string) => {
    switch (accion) {
      case 'crear':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'editar':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'eliminar':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'login':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'logout':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'generar':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'aprobar':
      case 'publicar':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatJSON = (data: any) => {
    if (!data) return 'N/A';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Datos inválidos';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold">Registros de Actividad</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fecha / Hora
              </th>
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Usuario
              </th>
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rol
              </th>
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Módulo
              </th>
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Acción
              </th>
              <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Descripción
              </th>
              <th className="h-10 px-6 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                  })}
                </td>
                <td className="px-6 py-3.5 font-medium text-foreground whitespace-nowrap">
                  {log.userEmail}
                </td>
                <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap capitalize">
                  {log.userRole}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium rounded-md px-2 py-0.5 border ${getModuleBadgeColor(
                      log.modulo
                    )}`}
                  >
                    {log.modulo}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium rounded-md px-2 py-0.5 border ${getActionBadgeColor(
                      log.accion
                    )}`}
                  >
                    {log.accion}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-xs text-muted-foreground max-w-xs truncate">
                  {log.descripcion || '-'}
                </td>
                <td className="px-6 py-3.5 text-center whitespace-nowrap">
                  <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">
              Detalle del Registro de Auditoría
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm mt-2">
              <div className="grid grid-cols-2 gap-4 border border-border rounded-lg p-4 bg-muted/20">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha y Hora (Perú)
                  </div>
                  <p className="text-sm font-semibold">
                    {new Date(selectedLog.createdAt).toLocaleString('es-PE', {
                      timeZone: 'America/Lima',
                    })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <User className="w-3.5 h-3.5" />
                    Usuario Responsable
                  </div>
                  <p className="text-sm font-semibold truncate">
                    {selectedLog.userEmail} ({selectedLog.userRole})
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Database className="w-3.5 h-3.5" />
                    Módulo / Acción
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium rounded-md px-2 py-0.5 border ${getModuleBadgeColor(
                        selectedLog.modulo
                      )}`}
                    >
                      {selectedLog.modulo}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium rounded-md px-2 py-0.5 border ${getActionBadgeColor(
                        selectedLog.accion
                      )}`}
                    >
                      {selectedLog.accion}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Database className="w-3.5 h-3.5" />
                    ID de Entidad
                  </div>
                  <p className="text-xs font-mono font-medium truncate mt-1">
                    {selectedLog.entidadId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Descripción de la acción</p>
                <p className="text-sm border border-border rounded-lg p-3 bg-white font-medium">
                  {selectedLog.descripcion || 'Sin descripción.'}
                </p>
              </div>

              {/* JSON de cambios */}
              {(selectedLog.datosAnteriores || selectedLog.datosNuevos) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Estado Anterior</p>
                    <pre className="text-xs font-mono border border-border rounded-lg p-3 bg-[#1e1e1e] text-emerald-400 overflow-auto max-h-48">
                      {formatJSON(selectedLog.datosAnteriores)}
                    </pre>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Nuevo Estado</p>
                    <pre className="text-xs font-mono border border-border rounded-lg p-3 bg-[#1e1e1e] text-cyan-400 overflow-auto max-h-48">
                      {formatJSON(selectedLog.datosNuevos)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
