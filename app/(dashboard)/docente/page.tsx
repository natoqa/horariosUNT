'use client';

import { Clock, CalendarDays, BookOpen, TrendingUp, CheckCircle2, Bell, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

/* ─── Sparkline ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success shrink-0 hidden sm:block">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

/* ─── Schedule Grid (decorative) ─── */
const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const bloques = ['07:00 - 08:30', '08:40 - 10:10', '10:20 - 11:50', '14:00 - 15:30', '15:40 - 17:10'];
const scheduleData: Record<string, Record<string, string>> = {
  'Lun': { '07:00 - 08:30': 'Cálculo I', '10:20 - 11:50': 'Álgebra' },
  'Mar': { '08:40 - 10:10': 'Cálculo I', '14:00 - 15:30': 'Estadística' },
  'Mié': { '07:00 - 08:30': 'Cálculo I', '10:20 - 11:50': 'Álgebra' },
  'Jue': { '08:40 - 10:10': 'Estadística', '15:40 - 17:10': 'Álgebra' },
  'Vie': { '07:00 - 08:30': 'Cálculo I' },
};

const courseColors: Record<string, string> = {
  'Cálculo I': 'bg-primary/10 text-primary border-primary/20',
  'Álgebra': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'Estadística': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

const cursosAsignados = [
  { curso: 'Cálculo I', grupo: 'A', tipo: 'Teórica', aula: 'A-201', sesiones: 4 },
  { curso: 'Álgebra', grupo: 'B', tipo: 'Teórica', aula: 'A-305', sesiones: 3 },
  { curso: 'Estadística', grupo: 'A', tipo: 'Práctica', aula: 'Lab-101', sesiones: 2 },
];

/* ─── Updates ─── */
const updates = [
  { icon: CheckCircle2, color: 'text-success', title: 'Horario Publicado', time: '11:20 AM', desc: 'Tu horario 2026-I está disponible' },
  { icon: Bell, color: 'text-chart-2', title: 'Recordatorio', time: '11:00 AM', desc: 'Registra tu disponibilidad' },
  { icon: FileText, color: 'text-chart-4', title: 'Periodo Abierto', time: '10:45 AM', desc: 'Periodo 2026-I en configuración' },
  { icon: CalendarDays, color: 'text-primary', title: 'Clase Asignada', time: '10:30 AM', desc: 'Cálculo I - Grupo A' },
];

const statCardClass =
  'rounded-xl border border-border bg-white p-4 sm:p-5 shadow-sm';

export default function DocenteDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Docente';

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1600px]">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
            Resumen de tu actividad y horarios asignados.
          </p>
        </div>
        <div className="flex shrink-0 w-full sm:w-auto">
          <select className="h-10 w-full sm:w-auto min-w-[10rem] px-3 rounded-lg border border-border bg-white text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Este semestre</option>
            <option>Semestre anterior</option>
          </select>
        </div>
      </div>

      {/* Top: Stat Cards + Updates */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_min(20rem,100%)] gap-5 sm:gap-6">
        {/* Stat Cards — 1 col móvil, hasta 4 en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 - Disponibilidad */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Disponibilidad
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Registrada</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                25 bloques disponibles
              </span>
              <SparklineUp />
            </div>
          </div>

          {/* Card 2 - Horario */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mi Horario
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10 shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">9</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                Sesiones semanales
              </span>
              <SparklineUp />
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm xl:row-span-2">
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
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
          <p className="px-4 sm:px-5 pt-3 text-xs text-muted-foreground font-medium">
            {updates.length} nuevas notificaciones
          </p>
          <div className="px-4 sm:px-5 pt-2 pb-4 space-y-0.5 max-h-[min(24rem,50vh)] overflow-y-auto">
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
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                        {u.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mi Horario Visual */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 lg:p-6 shadow-sm xl:col-span-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Mi Horario Semanal
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {Object.entries(courseColors).map(([name, cls]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${cls.split(' ')[0]}`} />
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Móvil: cards por día */}
          <div className="md:hidden space-y-3">
            {dias.map((dia) => {
              const sesiones = bloques
                .map((bloque) => ({ bloque, curso: scheduleData[dia]?.[bloque] }))
                .filter((s) => s.curso);

              return (
                <div
                  key={dia}
                  className="rounded-lg border border-border/80 bg-muted/20 overflow-hidden"
                >
                  <div className="px-3 py-2 bg-muted/40 border-b border-border/60">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {dia}
                    </span>
                  </div>
                  <div className="p-2 space-y-1.5">
                    {sesiones.length > 0 ? (
                      sesiones.map(({ bloque, curso }) => (
                        <div
                          key={bloque}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border/50 bg-white px-3 py-2"
                        >
                          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                            {bloque}
                          </span>
                          <span
                            className={`inline-flex w-fit px-2 py-1 rounded-md text-[11px] font-semibold border ${
                              courseColors[curso!] || 'bg-muted text-foreground'
                            }`}
                          >
                            {curso}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground/60 px-2 py-1.5">Sin clases</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet/desktop: tabla con scroll horizontal */}
          <div className="hidden md:block -mx-1 px-1">
            <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-border/50">
              <table className="w-full min-w-[36rem] text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="sticky left-0 z-10 bg-muted/30 h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-28 sm:w-32 border-r border-border/50">
                      Bloque
                    </th>
                    {dias.map((d) => (
                      <th
                        key={d}
                        className="h-9 px-2 min-w-[5.5rem] text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloques.map((bloque) => (
                    <tr key={bloque} className="border-t border-border/50">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 text-[11px] text-muted-foreground font-medium whitespace-nowrap border-r border-border/50">
                        {bloque}
                      </td>
                      {dias.map((dia) => {
                        const curso = scheduleData[dia]?.[bloque];
                        return (
                          <td key={dia} className="px-1.5 py-1.5 text-center min-w-[5.5rem]">
                            {curso ? (
                              <div
                                className={`px-2 py-2 rounded-md text-[10px] font-semibold border leading-tight ${
                                  courseColors[curso] || 'bg-muted text-foreground'
                                }`}
                              >
                                {curso}
                              </div>
                            ) : (
                              <div className="px-2 py-2 rounded-md text-[10px] text-muted-foreground/30">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground text-center lg:hidden">
              Desliza horizontalmente para ver todos los días
            </p>
          </div>
        </div>
      </div>

      {/* Mis Cursos */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Mis Cursos Asignados</h2>
        </div>

        {/* Móvil: cards */}
        <div className="md:hidden divide-y divide-border">
          {cursosAsignados.map((c, i) => (
            <div key={i} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{c.curso}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Grupo {c.grupo}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium">Tipo</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        c.tipo === 'Teórica' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Aula</dt>
                  <dd className="mt-0.5 text-foreground">{c.aula}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground font-medium">Sesiones</dt>
                  <dd className="mt-0.5 text-foreground">{c.sesiones} / semana</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Curso
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Grupo
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tipo
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Aula
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sesiones
                </th>
              </tr>
            </thead>
            <tbody>
              {cursosAsignados.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{c.curso}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground">Grupo {c.grupo}</td>
                  <td className="px-4 lg:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        c.tipo === 'Teórica' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground">{c.aula}</td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground">{c.sesiones} / semana</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
