'use client';

import { useState, useCallback, useEffect } from 'react';
import { Loader2, Download, Sheet, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getCargaDocenteAction, CargaDocenteRow } from '../actions/get-carga-docente.action';
import { generateCargaDocentePdfAction } from '../actions/generate-carga-docente-pdf.action';
import { generateExcelAction } from '../actions/generate-excel.action';
import { PdfPreviewDialog } from './pdf-preview-dialog';
import { Eye } from 'lucide-react';

type ReportState = 'idle' | 'loading' | 'error' | 'empty' | 'success' | 'generating-pdf' | 'generating-excel';

interface CargaDocenteReportProps {
  periodoId: string;
}

export function CargaDocenteReport({ periodoId }: CargaDocenteReportProps) {
  const [state, setState] = useState<ReportState>('idle');
  const [rows, setRows] = useState<CargaDocenteRow[]>([]);
  const [periodoName, setPeriodoName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await getCargaDocenteAction({ periodoId });

    if (result.data) {
      if (result.data.length === 0) {
        setState('empty');
        return;
      }
      setRows(result.data);
      setPeriodoName(result.periodoName ?? '');
      setState('success');
    } else {
      setErrorMessage(result.message ?? 'Error al cargar datos.');
      setState('error');
    }
  }, [periodoId]);

  const handleLoadIfNeeded = useCallback(() => {
    if (state === 'idle') {
      loadData();
    }
  }, [state, loadData]);

  useEffect(() => {
    handleLoadIfNeeded();
  }, [handleLoadIfNeeded]);

  const handleDownloadPdf = async (preview: boolean = false) => {
    setState('generating-pdf');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await generateCargaDocentePdfAction({ periodoId });

    if (result.pdfBase64 && result.fileName) {
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      if (preview) {
        setPreviewUrl(url);
        setPreviewOpen(true);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccessMessage('PDF descargado exitosamente.');
      }
      
      setState('success');
    } else {
      setErrorMessage(result.message ?? 'Error al generar el PDF.');
      setState('success');
    }
  };

  const handleDownloadExcel = async () => {
    setState('generating-excel');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await generateExcelAction({ periodoId });

    if (result.excelBase64 && result.fileName) {
      const bytes = Uint8Array.from(atob(result.excelBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('Excel descargado exitosamente.');
      setState('success');
    } else {
      setErrorMessage(result.message ?? 'Error al generar el Excel.');
      setState('success');
    }
  };

  const isGenerating = state === 'generating-pdf' || state === 'generating-excel';

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-2">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando carga docente...</p>
      </div>
    );
  }

  if (state === 'error' && !rows.length) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <Users className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin datos de carga docente</p>
        <p className="text-xs text-muted-foreground">
          No hay docentes registrados o el horario no tiene asignaciones.
        </p>
      </div>
    );
  }

  const totalDocentes = rows.length;
  const sobrecargados = rows.filter((r) => r.porcentaje >= 90).length;
  const sinAsignacion = rows.filter((r) => r.horasAsignadas === 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalDocentes}</p>
          <p className="text-xs text-muted-foreground">Total docentes</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{sobrecargados}</p>
          <p className="text-xs text-red-600">Carga &ge; 90%</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{sinAsignacion}</p>
          <p className="text-xs text-amber-600">Sin asignacion</p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Docente</th>
                <th className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</th>
                <th className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Regimen</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">H. Asig.</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">H. Max.</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">% Carga</th>
                <th className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cursos asignados</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOverloaded = row.porcentaje >= 90;
                const isUnassigned = row.horasAsignadas === 0;
                const rowBg = isOverloaded
                  ? 'bg-red-500/10'
                  : isUnassigned
                    ? 'bg-amber-500/10'
                    : '';

                return (
                  <tr
                    key={row.docenteId}
                    className={`border-b border-border last:border-0 ${rowBg}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{row.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.categoria}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.regimen}</td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{row.horasAsignadas}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{row.horasMaximas}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        isOverloaded
                          ? 'bg-red-100 text-red-600'
                          : isUnassigned
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {row.porcentaje}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate" title={row.cursos || 'Sin asignaciones'}>
                      {row.cursos || <span className="italic text-amber-600">Sin asignaciones</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          disabled={isGenerating}
          onClick={handleDownloadExcel}
        >
          {state === 'generating-excel' ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Generando Excel...
            </>
          ) : (
            <>
              <Sheet className="w-4 h-4 mr-1.5" />
              Descargar Excel
            </>
          )}
        </Button>
        <Button
          variant="outline"
          disabled={isGenerating}
          onClick={() => handleDownloadPdf(true)}
        >
          <Eye className="w-4 h-4 mr-1.5" />
          Previsualizar
        </Button>
        <Button
          disabled={isGenerating}
          onClick={() => handleDownloadPdf(false)}
        >
          {state === 'generating-pdf' ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-1.5" />
              Descargar PDF
            </>
          )}
        </Button>
      </div>

      <PdfPreviewDialog
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
        title="Vista Previa - Carga Docente"
        pdfUrl={previewUrl}
      />
    </div>
  );
}
