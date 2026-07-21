'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, FileText, AlertCircle, Download, Sheet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { ReportFilterType } from '../../domain/entities/report-config.entity';
import { PdfFilterPanel } from './pdf-filter-panel';
import { CargaDocenteReport } from './carga-docente-report';
import { OcupacionAulasReport } from './ocupacion-aulas-report';
import { generatePdfAction } from '../actions/generate-pdf.action';
import { generateExcelAction } from '../actions/generate-excel.action';
import { PdfPreviewDialog } from './pdf-preview-dialog';
import { Eye } from 'lucide-react';

type ContentState = 'loading' | 'error' | 'empty' | 'ready' | 'generating-pdf' | 'generating-excel';
type ReportTab = 'horarios' | 'carga-docente' | 'ocupacion-aulas';

interface PeriodoOption {
  id: string;
  name: string;
  state: string;
  tipoCiclo: string;
}

export function ReportesContent() {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<ContentState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoOption[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  const [filterType, setFilterType] = useState<ReportFilterType>('all');
  const [filterId, setFilterId] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('horarios');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadPeriodos = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    const { createClient } = await import('@/shared/lib/supabase/client');
    const supabase = createClient();

    const { data, error } = await supabase
      .from('periodos')
      .select('id, name, state, tipo_ciclo')
      .in('state', ['Aprobado', 'Publicado', 'Cerrado'])
      .order('created_at', { ascending: false });

    if (error) {
      setState('error');
      setErrorMessage('Error al cargar periodos.');
      return;
    }

    if (!data || data.length === 0) {
      setState('empty');
      return;
    }

    const options: PeriodoOption[] = data.map((p) => ({
      id: p.id,
      name: p.name,
      state: p.state,
      tipoCiclo: p.tipo_ciclo,
    }));

    setPeriodos(options);
    setSelectedPeriodoId(options[0].id);
    setState('ready');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState('error');
      setErrorMessage('Debe iniciar sesion.');
      return;
    }
    loadPeriodos();
  }, [user, authLoading, loadPeriodos]);

  const canGenerate =
    selectedPeriodoId &&
    (filterType === 'all' || filterId);

  const handleDownloadPdf = async (preview: boolean = false) => {
    setState('generating-pdf');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await generatePdfAction({
      periodoId: selectedPeriodoId,
      filterType,
      filterId: filterType === 'all' ? undefined : filterId,
    });

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
      
      setState('ready');
    } else {
      setErrorMessage(result.message ?? 'Error al generar el PDF.');
      setState('ready');
    }
  };

  const handleDownloadExcel = async () => {
    setState('generating-excel');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await generateExcelAction({
      periodoId: selectedPeriodoId,
    });

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
      setState('ready');
    } else {
      setErrorMessage(result.message ?? 'Error al generar el Excel.');
      setState('ready');
    }
  };

  if (authLoading || state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando reportes...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={loadPeriodos}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin periodos disponibles</p>
        <p className="text-xs text-muted-foreground">
          No hay periodos en estado Aprobado, Publicado o Cerrado para generar reportes.
        </p>
      </div>
    );
  }

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'horarios', label: 'Horarios' },
    { key: 'carga-docente', label: 'Carga Docente' },
    { key: 'ocupacion-aulas', label: 'Ocupacion Aulas' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Periodo academico</label>
          <select
            value={selectedPeriodoId}
            onChange={(e) => setSelectedPeriodoId(e.target.value)}
            className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.state})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'horarios' && (
          <div className="space-y-5">
            <PdfFilterPanel
              filterType={filterType}
              filterId={filterId}
              tipoCiclo={periodos.find(p => p.id === selectedPeriodoId)?.tipoCiclo}
              onFilterTypeChange={setFilterType}
              onFilterIdChange={setFilterId}
            />

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

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={!selectedPeriodoId || state === 'generating-pdf' || state === 'generating-excel'}
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
                disabled={!canGenerate || state === 'generating-pdf' || state === 'generating-excel'}
                onClick={() => handleDownloadPdf(true)}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Previsualizar
              </Button>
              <Button
                disabled={!canGenerate || state === 'generating-pdf' || state === 'generating-excel'}
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
          </div>
        )}

        {activeTab === 'carga-docente' && selectedPeriodoId && (
          <CargaDocenteReport
            key={selectedPeriodoId}
            periodoId={selectedPeriodoId}
          />
        )}

        {activeTab === 'ocupacion-aulas' && selectedPeriodoId && (
          <OcupacionAulasReport
            key={selectedPeriodoId}
            periodoId={selectedPeriodoId}
          />
        )}
      </div>

      <PdfPreviewDialog
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
        title="Vista Previa - Horarios"
        pdfUrl={previewUrl}
      />
    </div>
  );
}
