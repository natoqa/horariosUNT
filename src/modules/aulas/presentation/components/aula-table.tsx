'use client';

import { useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { Aula } from '../../domain/entities/aula.entity';
import { getAulasAction } from '../actions/get-aulas.action';
import { AulaEditDialog } from './aula-edit-dialog';
import { AulaRestriccionGrid } from './aula-restriccion-grid';
import { Input } from '@/shared/components/ui/input';
import { Landmark, Pencil, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

export interface AulaTableRef {
  refresh: () => void;
}

export function AulaStatusBadge({ estado }: { estado: 'Activa' | 'Inactiva' | 'Mantenimiento' }) {
  let config = { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };

  if (estado === 'Inactiva') {
    config = { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };
  } else if (estado === 'Mantenimiento') {
    config = { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {estado}
    </span>
  );
}

export const AulaTable = forwardRef<AulaTableRef>(function AulaTable(_, ref) {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [restrictingAula, setRestrictingAula] = useState<Aula | null>(null);

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  const loadAulas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getAulasAction({
      search: search || undefined,
      tipo: filterTipo || undefined,
      estado: filterEstado || undefined,
    });
    if (result.data) {
      setAulas(result.data);
    } else {
      setError(result.message || 'Error al cargar aulas.');
    }
    setLoading(false);
  }, [search, filterTipo, filterEstado]);

  useImperativeHandle(ref, () => ({ refresh: loadAulas }));

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAulas();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAulas]);

  return (
    <>
      <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row gap-3 bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los tipos</option>
          {['Aula Teórica', 'Laboratorio de Cómputo', 'Laboratorio Especializado', 'Auditorio'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
          <option value="Mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando aulas...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      ) : aulas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Landmark className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin aulas registradas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Registre la primera aula usando el formulario de la izquierda
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ubicación</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Capacidad</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamiento</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aulas.map((aula) => (
                <tr key={aula.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs font-bold text-muted-foreground uppercase">{aula.codigo}</td>
                  <td className="px-6 py-3.5 font-medium text-foreground">{aula.nombre}</td>
                  <td className="px-6 py-3.5 text-muted-foreground text-xs">
                    {aula.pabellon || 'N/A'} - Piso {aula.piso !== null ? aula.piso : 'N/A'}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-muted-foreground text-xs">{aula.capacidad} est.</td>
                  <td className="px-6 py-3.5 text-muted-foreground text-xs">{aula.tipo}</td>
                  <td className="px-6 py-3.5">
                    {aula.equipamiento.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {aula.equipamiento.map((eq, i) => (
                          <span key={i} className="inline-flex px-1.5 py-0.5 rounded-sm bg-muted text-[9px] text-muted-foreground font-medium border border-border">
                            {eq}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Básico</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <AulaStatusBadge estado={aula.estado} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1">
                      {isAllowed && (
                        <>
                          <button
                            onClick={() => setEditingAula(aula)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar aula"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRestrictingAula(aula)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Ver / Editar restricciones de horarios"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingAula && (
        <AulaEditDialog
          aula={editingAula}
          onClose={() => setEditingAula(null)}
          onSuccess={() => {
            setEditingAula(null);
            loadAulas();
          }}
        />
      )}

      {restrictingAula && (
        <AulaRestriccionGrid
          aula={restrictingAula}
          onClose={() => setRestrictingAula(null)}
        />
      )}
    </>
  );
});
