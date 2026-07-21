'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { Search, Users, BookOpen, CalendarDays, Building2, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (route: string) => {
    setOpen(false)
    router.push(route)
  }

  const results = [
    { title: 'Docentes', icon: Users, route: '/docentes', category: 'Gestión' },
    { title: 'Cursos', icon: BookOpen, route: '/cursos', category: 'Gestión' },
    { title: 'Aulas', icon: Building2, route: '/aulas', category: 'Gestión' },
    { title: 'Generar Horario', icon: CalendarDays, route: '/horarios', category: 'Acciones' },
  ].filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-xl bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl sm:rounded-xl">
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input
            className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground text-foreground"
            placeholder="Buscar profesores, cursos, o saltar a sección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              No se encontraron resultados para "{search}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Sugerencias
              </div>
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result.route)}
                  className="flex items-center w-full px-3 py-3 text-sm text-left rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group cursor-pointer"
                >
                  <result.icon className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="flex-1 font-medium">{result.title}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary/70 mr-2">{result.category}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
