'use client';

import { useState } from 'react';
import { HelpCircle, Search, Book, Video, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

const faqData = [
  {
    category: 'General',
    questions: [
      {
        q: '¿Cómo inicio sesión en el sistema?',
        a: 'Para iniciar sesión, utiliza tu correo institucional y contraseña proporcionada por la administración. Si tienes problemas, contacta a soporte técnico.',
      },
      {
        q: '¿Qué puedo hacer en el sistema como docente?',
        a: 'Como docente, puedes registrar tu disponibilidad horaria, ver tus horarios asignados, y gestionar tu perfil.',
      },
    ],
  },
  {
    category: 'Disponibilidad',
    questions: [
      {
        q: '¿Cómo registro mi disponibilidad?',
        a: 'Ve a la sección Disponibilidad y marca los bloques horarios en los que estás disponible para dictar clases.',
      },
      {
        q: '¿Puedo cambiar mi disponibilidad después de enviarla?',
        a: 'Sí, puedes modificar tu disponibilidad siempre que el periodo esté en estado de "Recopilación".',
      },
    ],
  },
  {
    category: 'Horarios',
    questions: [
      {
        q: '¿Cuándo puedo ver mi horario asignado?',
        a: 'Podrás ver tu horario cuando el periodo esté en estado "Publicado" o "Aprobado".',
      },
      {
        q: '¿Qué significa cada estado del periodo?',
        a: 'Configuración: Preparando el periodo. Recopilación: Recopilando datos de disponibilidad. Generación: Creando horarios. Aprobado: Horario aprobado. Publicado: Horario visible a todos.',
      },
    ],
  },
];

const tutorials = [
  {
    title: 'Introducción al Sistema',
    description: 'Aprende las basics del sistema de horarios',
    icon: Book,
    duration: '5 min',
  },
  {
    title: 'Registrar Disponibilidad',
    description: 'Cómo registrar tu disponibilidad horaria',
    icon: Video,
    duration: '8 min',
  },
  {
    title: 'Ver Horarios Asignados',
    description: 'Cómo consultar tu horario de clases',
    icon: Video,
    duration: '6 min',
  },
];

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centro de Ayuda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Encuentra respuestas a tus preguntas y aprende a usar el sistema.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en el centro de ayuda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Preguntas Frecuentes</h2>
          </div>
          
          {filteredFaq.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
            </div>
          ) : (
            filteredFaq.map((category) => (
              <div key={category.category} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">{category.category}</span>
                  {expandedCategory === category.category ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategory === category.category && (
                  <div className="px-4 pb-4 space-y-2">
                    {category.questions.map((item, idx) => (
                      <div key={idx} className="border-t border-border pt-3">
                        <button
                          onClick={() => toggleQuestion(item.q)}
                          className="w-full text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.q}
                        </button>
                        {expandedQuestion === item.q && (
                          <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Tutoriales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Tutoriales</h2>
          </div>

          <div className="space-y-3">
            {tutorials.map((tutorial, idx) => {
              const Icon = tutorial.icon;
              return (
                <div key={idx} className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{tutorial.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tutorial.description}</p>
                      <p className="text-xs text-primary mt-2 font-medium">{tutorial.duration}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contacto de Soporte */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">¿Necesitas más ayuda?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Si no encuentras la respuesta que buscas, contacta a nuestro equipo de soporte.
            </p>
            <Button variant="outline" className="w-full">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
