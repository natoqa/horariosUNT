'use client';

import { useState, useCallback, useEffect } from 'react';
import { Loader2, Download, Sheet, Building2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import {
  getOcupacionAulaAction,
  AulaResumen,
  OcupacionSlot,
} from '../actions/get-ocupacion-aula.action';
import { generateOcupacionAulasPdfAction } from '../actions/generate-ocupacion-aulas-pdf.action';
import { generateExcelAction } from '../actions/generate-excel.action';
import { PdfPreviewDialog } from './pdf-preview-dialog';
import { Eye } from 'lucide-react';

type ReportState = 'idle' | 'loading' | 'error' | 'empty' | 'success' | 'generating-pdf' | 'generating-excel';

interface OcupacionAulasReportProps {
  periodoId: string;
}

export function OcupacionAulasReport({ periodoId }: OcupacionAulasReportProps) {
  const [state, setState] = useState<ReportState>('idle');
  const [aulas, setAulas] = useState<AulaResumen[]>([]);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [slots, setSlots] = useState<OcupacionSlot[]>([]);
  const [aulaName, setAulaName] = useState('');
  const [porcentaje, setPorcentaje] = useState(0);
  const [periodoName, setPeriodoName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadResumen = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await getOcupacionAulaAction({ periodoId });

    if (result.aulas) {
      if (result.aulas.length === 0) {
        setState('empty');
        return;
      }
      setAulas(result.aulas);
      setPeriodoName(result.periodoName ?? '');
      setState('success');
    } else {
      setErrorMessage(result.message ?? 'Error al cargar datos.');
      setState('error');
    }
  }, [periodoId]);

  const loadAulaDetail = useCallback(async (aulaId: string) => {
    setState('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await getOcupacionAulaAction({ periodoId, aulaId });

    if (result.slots) {
      setSelectedAulaId(aulaId);
      setSlots(result.slots);
      setAulaName(result.aulaName ?? '');
      setPorcentaje(result.porcentaje ?? 0);
      setPeriodoName(result.periodoName ?? '');
      setState('success');
    } else {
      setErrorMessage(result.message ?? 'Error al cargar detalle del aula.');
      setState('error');
    }
  }, [periodoId]);

  const handleLoadIfNeeded = useCallback(() => {
    if (state === 'idle') {
      loadResumen();
    }
  }, [state, loadResumen]);

  useEffect(() => {
    handleLoadIfNeeded();
  }, [handleLoadIfNeeded]);

  const handleBack = () => {
    setSelectedAulaId(null);
    setSlots([]);
    setAulaName('');
    setPorcentaje(0);
    setState('success');
  };

  const handleDownloadPdf = async (preview: boolean = false) => {
    if (!selectedAulaId) return;
    setState('generating-pdf');
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await generateOcupacionAulasPdfAction({ periodoId, aulaId: selectedAulaId });

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
        <p className="text-xs text-muted-foreground">Cargando ocupacion de aulas...</p>
      </div>
    );
  }

  if (state === 'error' && !aulas.length && !selectedAulaId) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={loadResumen}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin datos de ocupacion</p>
        <p className="text-xs text-muted-foreground">
          No hay aulas registradas o el horario no tiene asignaciones.
        </p>
      </div>
    );
  }

  if (selectedAulaId) {
    const slotMap = new Map<string, OcupacionSlot>();
    for (const s of slots) {
      slotMap.set(`${s.dia}||${s.bloque}`, s);
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
          <div>
            <p className="text-sm font-semibold text-foreground">{aulaName}</p>
            <p className="text-xs text-muted-foreground">
              Ocupacion: <span className={porcentaje >= 80 ? 'text-red-600 font-semibold' : ''}>{porcentaje}%</span> — {periodoName}
            </p>
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
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="h-9 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                    Horario
                  </th>
                  {DIAS_SEMANA.map((dia) => (
                    <th
                      key={dia}
                      className="h-9 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOQUES_HORARIOS.map((bloque) => (
                  <tr key={bloque} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {bloque}
                    </td>
                    {DIAS_SEMANA.map((dia) => {
                      const slot = slotMap.get(`${dia}||${bloque}`);
                      return (
                        <td
                          key={dia}
                          className={`px-2 py-2 text-center ${
                            slot ? 'bg-blue-500/10' : 'bg-muted/20'
                          }`}
                        >
                          {slot ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px] mx-auto" title={slot.curso}>
                                {slot.curso}
                              </p>
                              <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px] mx-auto" title={slot.docente}>
                                {slot.docente}
                              </p>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
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
      </div>
    );
  }

  const totalAulas = aulas.length;
  const promedioOcupacion = totalAulas > 0
    ? Math.round(aulas.reduce((sum, a) => sum + a.porcentaje, 0) / totalAulas)
    : 0;
  const aulasAltas = aulas.filter((a) => a.porcentaje >= 80).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalAulas}</p>
          <p className="text-xs text-muted-foreground">Total aulas</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{promedioOcupacion}%</p>
          <p className="text-xs text-muted-foreground">Promedio ocupacion</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{aulasAltas}</p>
          <p className="text-xs text-red-600">Ocupacion &ge; 80%</p>
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
                <th className="h-10 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aula</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bloques ocupados</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bloques totales</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">% Ocupacion</th>
                <th className="h-10 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accion</th>
              </tr>
            </thead>
            <tbody>
              {aulas.map((aula) => {
                const isHigh = aula.porcentaje >= 80;
                return (
                  <tr
                    key={aula.aulaId}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 ${isHigh ? 'bg-red-500/10' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{aula.aulaName}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{aula.bloquesOcupados}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{aula.bloquesTotales}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        isHigh
                          ? 'bg-red-100 text-red-600'
                          : aula.porcentaje === 0
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {aula.porcentaje}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadAulaDetail(aula.aulaId)}
                      >
                        Ver grilla
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
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
      </div>

      <PdfPreviewDialog
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
        title={`Vista Previa - Ocupación ${aulaName}`}
        pdfUrl={previewUrl}
      />
    </div>
  );
}
