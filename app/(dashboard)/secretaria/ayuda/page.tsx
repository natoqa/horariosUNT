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
        q: '¿Qué roles existen en el sistema?',
        a: 'El sistema tiene tres roles principales: Director (gestión completa), Secretaria (gestión académica), y Docente (gestión de disponibilidad y visualización de horarios).',
      },
    ],
  },
  {
    category: 'Gestión de Cursos',
    questions: [
      {
        q: '¿Cómo creo un nuevo curso?',
        a: 'Ve a la sección Cursos y haz clic en "Crear Curso". Completa el código, nombre, ciclo, tipo, horas teóricas/prácticas y créditos.',
      },
      {
        q: '¿Cómo asigno docentes a grupos?',
        a: 'Al crear o editar un grupo (sección) de un curso, puedes seleccionar el docente asignado desde el dropdown correspondiente.',
      },
    ],
  },
  {
    category: 'Gestión de Aulas',
    questions: [
      {
        q: '¿Cómo registro un nuevo aula?',
        a: 'Ve a la sección Aulas y haz clic en "Crear Aula". Completa el código, nombre, capacidad, tipo y restricciones del aula.',
      },
      {
        q: '¿Qué tipos de aulas existen?',
        a: 'El sistema soporta aulas normales, laboratorios, y salas especiales. Cada tipo puede tener restricciones específicas.',
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
    title: 'Gestión de Cursos',
    description: 'Cómo crear y gestionar cursos y grupos',
    icon: Video,
    duration: '10 min',
  },
  {
    title: 'Gestión de Aulas',
    description: 'Proceso completo de gestión de infraestructura',
    icon: Video,
    duration: '8 min',
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
