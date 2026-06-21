'use client';

import { AuditoriaFilters } from './auditoria-filters';
import { AuditoriaTable } from './auditoria-table';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { getAuditLogsAction } from '../actions/get-audit-logs.action';
import { exportAuditoriaExcelAction } from '../actions/export-auditoria-excel.action';
import { useEffect, useState, startTransition } from 'react';
import { AlertCircle, ClipboardList, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface FiltersState {
  userEmail: string;
  modulo: string;
  accion: string;
  startDate: string;
  endDate: string;
}

export function AuditoriaContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FiltersState>({
    userEmail: '',
    modulo: '',
    accion: '',
    startDate: '',
    endDate: '',
  });
  const [exporting, setExporting] = useState(false);

  const fetchLogs = (filters: FiltersState) => {
    setLoading(true);
    setError(null);
    startTransition(async () => {
      const res = await getAuditLogsAction(filters);
      if (res.message) {
        setError(res.message);
        setLogs([]);
      } else if (res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (filters: FiltersState) => {
    setActiveFilters(filters);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await exportAuditoriaExcelAction(activeFilters);
      if (res.message) {
        toast.error(res.message);
      } else if (res.data) {
        const blob = new Blob([new Uint8Array(res.data)], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Registro de auditoría exportado exitosamente');
      }
    } catch (error) {
      toast.error('Error al exportar el registro de auditoría');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AuditoriaFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex items-center justify-center py-20 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando logs de auditoría...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg border border-destructive/20">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-xl bg-card text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <ClipboardList className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin registros de auditoría</p>
          <p className="text-xs text-muted-foreground mt-1">
            No se encontraron logs con los criterios de búsqueda actuales.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </Button>
          </div>
          <AuditoriaTable logs={logs} />
        </div>
      )}
    </div>
  );
}
