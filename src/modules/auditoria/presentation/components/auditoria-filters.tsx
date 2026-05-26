'use client';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

interface FiltersState {
  userEmail: string;
  modulo: string;
  accion: string;
  startDate: string;
  endDate: string;
}

interface AuditoriaFiltersProps {
  onFilterChange: (filters: FiltersState) => void;
}

const MODULOS = [
  { value: 'auth', label: 'Autenticación' },
  { value: 'periodos', label: 'Períodos Académicos' },
  { value: 'docentes', label: 'Docentes' },
  { value: 'cursos', label: 'Cursos' },
  { value: 'aulas', label: 'Aulas' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'horarios', label: 'Horarios' },
  { value: 'reportes', label: 'Reportes' },
  { value: 'auditoria', label: 'Auditoría' },
  { value: 'notificaciones', label: 'Notificaciones' },
];

const ACCIONES = [
  { value: 'login', label: 'Iniciar Sesión' },
  { value: 'logout', label: 'Cerrar Sesión' },
  { value: 'crear', label: 'Crear' },
  { value: 'editar', label: 'Editar' },
  { value: 'eliminar', label: 'Eliminar' },
  { value: 'generar', label: 'Generar' },
  { value: 'aprobar', label: 'Aprobar' },
  { value: 'publicar', label: 'Publicar' },
];

export function AuditoriaFilters({ onFilterChange }: AuditoriaFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    userEmail: '',
    modulo: 'all',
    accion: 'all',
    startDate: '',
    endDate: '',
  });

  const handleChange = (key: keyof FiltersState, value: string) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  const handleApply = () => {
    // Normalizar 'all' a vacío para la consulta
    const queryFilters = {
      userEmail: filters.userEmail,
      modulo: filters.modulo === 'all' ? '' : filters.modulo,
      accion: filters.accion === 'all' ? '' : filters.accion,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
    onFilterChange(queryFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      userEmail: '',
      modulo: 'all',
      accion: 'all',
      startDate: '',
      endDate: '',
    };
    setFilters(resetFilters);
    onFilterChange({
      userEmail: '',
      modulo: '',
      accion: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Filtros de Búsqueda</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Email de Usuario */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Usuario (Email)</Label>
          <Input
            type="text"
            placeholder="ejemplo@unt.edu.pe"
            value={filters.userEmail}
            onChange={(e) => handleChange('userEmail', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Módulo */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Módulo</Label>
          <Select
            value={filters.modulo}
            onValueChange={(val) => handleChange('modulo', val)}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Todos los módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los módulos</SelectItem>
              {MODULOS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Acción */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Acción</Label>
          <Select
            value={filters.accion}
            onValueChange={(val) => handleChange('accion', val)}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Todas las acciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              {ACCIONES.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Inicio */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Desde</Label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Fecha Fin */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Hasta</Label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-9 gap-1.5 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleApply}
          className="h-9 gap-1.5 text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
}
