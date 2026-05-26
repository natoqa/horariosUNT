'use client'

import { useEffect, useState } from 'react';
import { User } from '@/modules/auth';
import { createClient } from '../lib/supabase/client';
import { UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setUser(null);
        } else {
          setUser({
            id: user.id,
            email: user.email!,
            role: (user.user_metadata?.role as UserRole) || 'docente',
            fullName: user.user_metadata?.full_name,
          });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: (session.user.user_metadata?.role as UserRole) || 'docente',
            fullName: session.user.user_metadata?.full_name,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
