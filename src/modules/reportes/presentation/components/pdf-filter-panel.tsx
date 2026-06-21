'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/shared/components/ui/label';
import { REPORT_FILTER_TYPES, ReportFilterType, CICLOS } from '../../domain/entities/report-config.entity';
import { CICLOS_IMPAR, CICLOS_PAR } from '@/modules/periodos/domain/entities/periodo.entity';
import { createClient } from '@/shared/lib/supabase/client';

interface SelectOption {
  id: string;
  label: string;
}

const FILTER_LABELS: Record<ReportFilterType, string> = {
  all: 'Horario completo',
  ciclo: 'Por ciclo',
  docente: 'Por docente',
  aula: 'Por aula',
};

interface PdfFilterPanelProps {
  filterType: ReportFilterType;
  filterId: string;
  tipoCiclo?: string;
  onFilterTypeChange: (type: ReportFilterType) => void;
  onFilterIdChange: (id: string) => void;
}

export function PdfFilterPanel({
  filterType,
  filterId,
  tipoCiclo,
  onFilterTypeChange,
  onFilterIdChange,
}: PdfFilterPanelProps) {
  const [docentes, setDocentes] = useState<SelectOption[]>([]);
  const [aulas, setAulas] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (filterType === 'docente' && docentes.length === 0) {
      loadDocentes();
    } else if (filterType === 'aula' && aulas.length === 0) {
      loadAulas();
    }
  }, [filterType]);

  const loadDocentes = async () => {
    setLoadingOptions(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('docentes')
      .select('id, nombres, apellidos')
      .eq('estado', 'Activo')
      .order('apellidos');

    setDocentes(
      (data ?? []).map((d) => ({ id: d.id, label: `${d.apellidos}, ${d.nombres}` })),
    );
    setLoadingOptions(false);
  };

  const loadAulas = async () => {
    setLoadingOptions(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('aulas')
      .select('id, codigo, nombre')
      .eq('estado', 'Activa')
      .order('codigo');

    setAulas(
      (data ?? []).map((a) => ({ id: a.id, label: `${a.codigo} - ${a.nombre}` })),
    );
    setLoadingOptions(false);
  };

  const handleTypeChange = (type: ReportFilterType) => {
    onFilterTypeChange(type);
    onFilterIdChange('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Tipo de reporte</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REPORT_FILTER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted/50'
              }`}
            >
              {FILTER_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {filterType === 'ciclo' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Ciclo</Label>
          <div className="flex flex-wrap gap-2">
            {(tipoCiclo === 'Impar' ? CICLOS_IMPAR : tipoCiclo === 'Par' ? CICLOS_PAR : CICLOS).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onFilterIdChange(c)}
                className={`w-10 h-10 rounded-lg text-xs font-medium border transition-colors ${
                  filterId === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {filterType === 'docente' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Docente</Label>
          {loadingOptions ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Cargando docentes...
            </div>
          ) : (
            <select
              value={filterId}
              onChange={(e) => onFilterIdChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Seleccionar docente...</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {filterType === 'aula' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Aula</Label>
          {loadingOptions ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Cargando aulas...
            </div>
          ) : (
            <select
              value={filterId}
              onChange={(e) => onFilterIdChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Seleccionar aula...</option>
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
