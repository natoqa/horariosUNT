'use client';

import { useState } from 'react';
import { MessageSquare, Send, Star, Filter, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAuth } from '@/shared/hooks/use-auth';

interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  rating: number;
  category: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export default function ComentariosPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Sugerencia');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: user?.fullName || 'Usuario',
      authorEmail: user?.email || '',
      content: newComment,
      rating,
      category,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setRating(5);
  };

  const filteredComments = comments.filter(comment => {
    const matchesFilter = filter === 'all' || comment.status === filter;
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comment.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'reviewed':
        return 'bg-blue-50 text-blue-700';
      case 'resolved':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'reviewed':
        return 'Revisado';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comentarios y Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comparte tus sugerencias, reporta problemas o deja tu opinión sobre el sistema.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario de nuevo comentario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-white p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Nuevo Comentario</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm"
                >
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Problema">Problema</option>
                  <option value="Pregunta">Pregunta</option>
                  <option value="Elogio">Elogio</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Comentario</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario aquí..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Comentario
              </Button>
            </form>
          </div>
        </div>

        {/* Lista de comentarios */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros y búsqueda */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comentarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  Pendientes
                </Button>
                <Button
                  variant={filter === 'reviewed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('reviewed')}
                >
                  Revisados
                </Button>
                <Button
                  variant={filter === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('resolved')}
                >
                  Resueltos
                </Button>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          {filteredComments.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || filter !== 'all' 
                  ? 'No hay comentarios que coincidan con tu búsqueda.' 
                  : 'Aún no hay comentarios. Sé el primero en compartir tu opinión.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {getStatusLabel(comment.status)}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3">{comment.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted">
                      {comment.category}
                    </span>
                    <span>{new Date(comment.createdAt).toLocaleDateString('es-PE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
