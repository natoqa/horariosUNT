'use client';

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Curso } from '../../domain/entities/curso.entity';
import { getCursosAction } from '../actions/get-cursos.action';
import { CursoEditDialog } from './curso-edit-dialog';
import { GrupoManager } from './grupo-manager';
import { Input } from '@/shared/components/ui/input';
import { BookOpen, Pencil, Search, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

export interface CursoTableRef {
  refresh: () => void;
}

export function CursoStatusBadge({ estado }: { estado: 'Activo' | 'Inactivo' }) {
  const config = estado === 'Activo'
    ? { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
    : { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {estado}
    </span>
  );
}

export const CursoTable = forwardRef<CursoTableRef>(function CursoTable(_, ref) {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTipoCiclo, setFilterTipoCiclo] = useState('');
  const [filterCiclo, setFilterCiclo] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [managingGrupos, setManagingGrupos] = useState<Curso | null>(null);
  const [expandedCiclos, setExpandedCiclos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (cursos.length > 0) {
      const ciclos = new Set(cursos.map(c => c.ciclo));
      setExpandedCiclos(ciclos);
    }
  }, [cursos]);

  const toggleCiclo = (ciclo: string) => {
    const next = new Set(expandedCiclos);
    if (next.has(ciclo)) next.delete(ciclo);
    else next.add(ciclo);
    setExpandedCiclos(next);
  };

  const groupedCursos = cursos.reduce((acc, curso) => {
    if (!acc[curso.ciclo]) acc[curso.ciclo] = [];
    acc[curso.ciclo].push(curso);
    return acc;
  }, {} as Record<string, Curso[]>);

  const CICLO_ORDER: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
    'Electivo': 11, 'Sin Ciclo': 12
  };

  const sortedCiclos = Object.keys(groupedCursos).sort((a, b) => {
    return (CICLO_ORDER[a] || 99) - (CICLO_ORDER[b] || 99);
  });

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  const loadCursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getCursosAction({
      search: search || undefined,
      tipoCiclo: (filterTipoCiclo as 'Impar' | 'Par') || undefined,
      ciclo: filterCiclo || undefined,
      tipo: filterTipo || undefined,
      estado: filterEstado || undefined,
    });
    if (result.data) {
      setCursos(result.data);
    } else {
      setError(result.message || 'Error al cargar cursos.');
    }
    setLoading(false);
  }, [search, filterTipoCiclo, filterCiclo, filterTipo, filterEstado]);

  useImperativeHandle(ref, () => ({ refresh: loadCursos }));

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCursos();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCursos]);

  return (
    <>
      <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row gap-3">
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
          value={filterTipoCiclo}
          onChange={(e) => {
            setFilterTipoCiclo(e.target.value);
            setFilterCiclo(''); // Reset specific cycle when changing type
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Cualquier tipo de ciclo</option>
          <option value="Impar">Ciclos Impares</option>
          <option value="Par">Ciclos Pares</option>
        </select>
        <select
          value={filterCiclo}
          onChange={(e) => setFilterCiclo(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los ciclos</option>
          {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
            .filter((c) => {
              if (filterTipoCiclo === 'Impar') return ['I', 'III', 'V', 'VII', 'IX'].includes(c);
              if (filterTipoCiclo === 'Par') return ['II', 'IV', 'VI', 'VIII', 'X'].includes(c);
              return true;
            })
            .map((c) => (
              <option key={c} value={c}>Ciclo {c}</option>
            ))}
        </select>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="Teórico">Teórico</option>
          <option value="Práctico">Práctico</option>
          <option value="Teórico-Práctico">Teórico-Práctico</option>
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando cursos...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      ) : cursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin cursos registrados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Registre el primer curso usando el formulario de la izquierda
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ciclo</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horas T/P</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Créditos</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Laboratorio</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="h-10 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            {sortedCiclos.map(ciclo => {
              const isExpanded = expandedCiclos.has(ciclo);
              const cicloCursos = groupedCursos[ciclo];
              
              return (
                <tbody key={ciclo}>
                  <tr 
                    className="bg-muted/40 border-b border-border cursor-pointer hover:bg-muted/60 transition-colors"
                    onClick={() => toggleCiclo(ciclo)}
                  >
                    <td colSpan={9} className="px-6 py-2">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        Ciclo {ciclo}
                        <span className="text-xs text-muted-foreground ml-2 font-normal">
                          ({cicloCursos.length} {cicloCursos.length === 1 ? 'curso' : 'cursos'})
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && cicloCursos.map((curso) => (
                    <tr key={curso.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-muted-foreground uppercase">{curso.codigo}</td>
                      <td className="px-6 py-3.5 font-medium text-foreground">{curso.nombre}</td>
                      <td className="px-6 py-3.5 font-semibold text-muted-foreground text-xs">Ciclo {curso.ciclo}</td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs">{curso.tipo}</td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs">
                        {curso.horasTeoricas}h Teo / {curso.horasPracticas}h Prac
                      </td>
                      <td className="px-6 py-3.5 font-medium text-muted-foreground text-xs">{curso.creditos}</td>
                      <td className="px-6 py-3.5">
                        {curso.requiereLaboratorio ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">
                              Requerido
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{curso.tipoLaboratorio}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <CursoStatusBadge estado={curso.estado} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1">
                          {isAllowed && (
                            <button
                              onClick={() => setEditingCurso(curso)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Editar curso"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setManagingGrupos(curso)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Gestionar secciones (Grupos)"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      )}

      {editingCurso && (
        <CursoEditDialog
          curso={editingCurso}
          onClose={() => setEditingCurso(null)}
          onSuccess={() => {
            setEditingCurso(null);
            loadCursos();
          }}
        />
      )}

      {managingGrupos && (
        <GrupoManager
          curso={managingGrupos}
          onClose={() => setManagingGrupos(null)}
        />
      )}
    </>
  );
});
