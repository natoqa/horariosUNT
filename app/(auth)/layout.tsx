export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-[oklch(0.2_0.04_260)] p-10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Horarios UNT</span>
        </div>
        <div className="space-y-6">
          <blockquote className="text-2xl font-light leading-relaxed">
            Sistema Inteligente de Gestion y Generacion Automatica de Horarios Academicos
          </blockquote>
          <p className="text-white/60 text-sm">
            Escuela Profesional de Ingenieria de Sistemas<br />
            Universidad Nacional de Trujillo
          </p>
        </div>
        <p className="text-xs text-white/40">
          2026 - Todos los derechos reservados
        </p>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        {children}
      </div>
    </div>
  )
}
