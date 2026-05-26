'use client';

import { CalendarDays, Users, BookOpen, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

/* ─── Sparkline SVGs ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success shrink-0 hidden sm:block">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineDown() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-destructive shrink-0 hidden sm:block">
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineFlat() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-chart-2 shrink-0 hidden sm:block">
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
  const maxVal = Math.max(...barData.map((d) => d.value));
  return (
    <div className="overflow-x-auto overscroll-x-contain -mx-1 px-1 mt-4">
      <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-44 min-w-[18rem]">
        {barData.map((d, i) => {
          const heightPct = (d.value / maxVal) * 100;
          const isHighlighted = i === 3;
          return (
            <div key={d.label} className="flex-1 min-w-[2.25rem] flex flex-col items-center gap-2">
              <div className="relative w-full flex justify-center h-full items-end">
                {isHighlighted && (
                  <div className="absolute -top-7 sm:-top-8 bg-foreground text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap z-10">
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
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">{d.label}</span>
            </div>
          );
        })}
      </div>
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

const statCardClass =
  'rounded-xl border border-border bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5';

const panelClass =
  'rounded-xl border border-border bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80';

export default function DirectorDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Director';

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1600px]">
      {/* Greeting + Time Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
            Aquí tienes las últimas novedades del sistema de horarios.
          </p>
        </div>
        <div className="flex shrink-0 w-full sm:w-auto">
          <select className="h-10 w-full sm:w-auto min-w-[10rem] px-3 rounded-lg border border-border bg-white text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Último mes</option>
            <option>Última semana</option>
            <option>Hoy</option>
          </select>
        </div>
      </div>

      {/* Top Row: Stat Cards + Updates + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_min(20rem,100%)] gap-5 sm:gap-6">
        {/* Stat Cards — 1 col móvil, 2 tablet, 3-4 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 - Periodo Activo */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Periodo Activo
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10 shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">2026-I</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                Activo
              </span>
              <SparklineUp />
            </div>
          </div>

          {/* Card 2 - Docentes */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Docentes Activos
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-3 bg-chart-3/10 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">48</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                +12% vs sem. anterior
              </span>
              <SparklineFlat />
            </div>
          </div>

          {/* Card 3 - Cursos */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cursos Registrados
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">32</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-destructive leading-snug">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                -2% vs sem. anterior
              </span>
              <SparklineDown />
            </div>
          </div>
        </div>

        {/* Latest Updates */}
        <div className={`${panelClass} xl:row-span-2`}>
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Últimas Actualizaciones</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 sm:px-5 pt-3">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white">
              Hoy
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              Ayer
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              Esta semana
            </button>
          </div>
          <div className="px-4 sm:px-5 pt-3">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/30">
              <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs text-muted-foreground">Buscar actividades</span>
            </div>
          </div>
          <p className="px-4 sm:px-5 pt-3 text-xs text-muted-foreground font-medium">
            {updates.length} nuevas actividades hoy
          </p>
          <div className="px-4 sm:px-5 pt-2 pb-4 space-y-0.5 max-h-[min(28rem,50vh)] overflow-y-auto">
            {updates.map((u, i) => {
              const Icon = u.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-default"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-muted ${u.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground leading-tight">{u.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{u.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Area */}
        <div className={`${panelClass} p-4 sm:p-5 lg:p-6 xl:col-span-1`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Carga Horaria Semanal</h2>
            <select className="h-9 w-full sm:w-auto px-2.5 rounded-lg border border-border bg-white text-xs text-muted-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">
              <option>Último mes</option>
              <option>Última semana</option>
            </select>
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-3 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">358</span>
            <span className="text-xs font-medium text-success flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +8% vs sem. anterior
            </span>
          </div>
          <BarChart />
          <p className="mt-2 text-[10px] text-muted-foreground text-center sm:hidden">
            Desliza horizontalmente para ver todos los días
          </p>
        </div>
      </div>

      {/* Table: Resumen de Periodos */}
      <div className={panelClass}>
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Resumen de Periodos</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white flex-1 sm:flex-initial">
              <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs text-muted-foreground">Periodo</span>
            </div>
            <button className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrar
            </button>
          </div>
        </div>

        {/* Móvil: cards */}
        <div className="md:hidden divide-y divide-border">
          {periods.map((p) => (
            <div
              key={p.id}
              className="p-4 space-y-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{p.id}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{p.name}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${p.estadoColor}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {p.estado}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium">Responsable</dt>
                  <dd className="mt-0.5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {p.responsable.split(' ')[1]?.[0] || 'D'}
                    </div>
                    <span className="text-foreground truncate">{p.responsable}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Inicio</dt>
                  <dd className="mt-0.5 text-foreground tabular-nums">{p.fecha}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Desktop: tabla con scroll horizontal en pantallas medianas */}
        <div className="hidden md:block overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Periodo ID
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nombre
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Estado
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Responsable
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Fecha Inicio
                </th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-3.5">
                    <span className="font-medium text-foreground">{p.id}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground">{p.name}</td>
                  <td className="px-4 lg:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${p.estadoColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {p.responsable.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <span className="text-muted-foreground">{p.responsable}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground tabular-nums">{p.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="md:hidden px-4 py-2 text-[10px] text-muted-foreground text-center border-t border-border/50">
          Vista en tarjetas optimizada para móvil
        </p>
      </div>
    </div>
  );
}
