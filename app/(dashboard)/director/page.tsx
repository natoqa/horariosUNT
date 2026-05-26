'use client';

import { CalendarDays, Users, BookOpen, Building2, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

/* ─── Sparkline SVGs ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineDown() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-destructive">
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineFlat() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-chart-2">
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12 L62 32 L2 32 Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

/* ─── Bar Chart (decorative) ─── */
const barData = [
  { label: 'Lun', value: 45 },
  { label: 'Mar', value: 72 },
  { label: 'Mié', value: 58 },
  { label: 'Jue', value: 88 },
  { label: 'Vie', value: 65 },
  { label: 'Sáb', value: 30 },
];

function BarChart() {
  const maxVal = Math.max(...barData.map(d => d.value));
  return (
    <div className="flex items-end gap-3 h-44 mt-4">
      {barData.map((d, i) => {
        const heightPct = (d.value / maxVal) * 100;
        const isHighlighted = i === 3;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex justify-center">
              {isHighlighted && (
                <div className="absolute -top-8 bg-foreground text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap">
                  Jue: {d.value}
                </div>
              )}
              <div
                className={`w-full max-w-[40px] rounded-md transition-all duration-500 ${
                  isHighlighted ? 'bg-foreground' : 'bg-muted-foreground/15'
                }`}
                style={{ height: `${heightPct}%`, minHeight: '8px' }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Updates Feed ─── */
const updates = [
  { icon: CheckCircle2, color: 'text-success', title: 'Periodo Actualizado', time: '11:20 AM', desc: 'Periodo 2026-I configurado' },
  { icon: Users, color: 'text-chart-2', title: 'Docente Agregado', time: '11:15 AM', desc: 'Juan Pérez registrado' },
  { icon: AlertTriangle, color: 'text-warning', title: 'Conflicto Detectado', time: '11:00 AM', desc: 'Aula A-201 con solapamiento' },
  { icon: CalendarDays, color: 'text-primary', title: 'Horario Generado', time: '10:45 AM', desc: 'Horario borrador 2026-I' },
  { icon: FileText, color: 'text-chart-4', title: 'Reporte Exportado', time: '10:30 AM', desc: 'Reporte de disponibilidad' },
  { icon: BookOpen, color: 'text-chart-3', title: 'Curso Actualizado', time: '10:30 AM', desc: 'Cálculo I - 3 grupos' },
];

/* ─── Recent Periods Table ─── */
const periods = [
  { id: '#2026-I', name: 'Primer Semestre 2026', estado: 'Configuración', fecha: '2026-03-15', responsable: 'Dir. García', estadoColor: 'bg-blue-50 text-blue-700' },
  { id: '#2025-II', name: 'Segundo Semestre 2025', estado: 'Finalizado', fecha: '2025-08-10', responsable: 'Dir. García', estadoColor: 'bg-emerald-50 text-emerald-700' },
  { id: '#2025-I', name: 'Primer Semestre 2025', estado: 'Finalizado', fecha: '2025-03-01', responsable: 'Dir. López', estadoColor: 'bg-emerald-50 text-emerald-700' },
  { id: '#2024-II', name: 'Segundo Semestre 2024', estado: 'Archivado', fecha: '2024-08-12', responsable: 'Dir. López', estadoColor: 'bg-gray-100 text-gray-600' },
];

export default function DirectorDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Director';

  return (
    <div className="space-y-6">
      {/* Greeting + Time Filter */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aquí tienes las últimas novedades del sistema de horarios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">
            <option>Último mes</option>
            <option>Última semana</option>
            <option>Hoy</option>
          </select>
        </div>
      </div>

      {/* Top Row: 3 Stat Cards + Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 - Periodo Activo */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Periodo Activo</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-primary bg-primary/10">
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">2026-I</p>
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="w-3 h-3" />
                Activo
              </span>
              <SparklineUp />
            </div>
          </div>

          {/* Card 2 - Docentes */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Docentes Activos</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-3 bg-chart-3/10">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">48</p>
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="w-3 h-3" />
                +12% vs sem. anterior
              </span>
              <SparklineFlat />
            </div>
          </div>

          {/* Card 3 - Cursos */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Cursos Registrados</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">32</p>
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                <TrendingDown className="w-3 h-3" />
                -2% vs sem. anterior
              </span>
              <SparklineDown />
            </div>
          </div>
        </div>

        {/* Right: Latest Updates */}
        <div className="rounded-xl border border-border bg-white overflow-hidden row-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Últimas Actualizaciones</h2>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 px-5 pt-3">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white">Hoy</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Ayer</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Esta semana</button>
          </div>
          {/* Search */}
          <div className="px-5 pt-3">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted/30">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-xs text-muted-foreground">Buscar actividades</span>
            </div>
          </div>
          {/* Count */}
          <p className="px-5 pt-3 text-xs text-muted-foreground font-medium">{updates.length} nuevas actividades hoy</p>
          {/* List */}
          <div className="px-5 pt-2 pb-4 space-y-1 max-h-[400px] overflow-y-auto">
            {updates.map((u, i) => {
              const Icon = u.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-default">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted ${u.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{u.title}</p>
                      <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{u.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{u.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Area */}
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Carga Horaria Semanal</h2>
            </div>
            <select className="h-8 px-2.5 rounded-lg border border-border bg-white text-xs text-muted-foreground font-medium cursor-pointer">
              <option>Último mes</option>
              <option>Última semana</option>
            </select>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">358</span>
            <span className="text-xs font-medium text-success flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +8% vs sem. anterior
            </span>
          </div>
          <BarChart />
        </div>
      </div>

      {/* Table: Resumen de Periodos */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Resumen de Periodos</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-white">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-xs text-muted-foreground">Periodo</span>
            </div>
            <button className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filtrar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Periodo ID</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsable</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha Inicio</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-foreground">{p.id}</span>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{p.name}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${p.estadoColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {p.responsable.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <span className="text-muted-foreground">{p.responsable}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{p.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
