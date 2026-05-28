'use client';

import { useRouter } from 'next/navigation';
import { DocenteForm } from './docente-form';
import { useAuth } from '@/shared/hooks/use-auth';

export function DocentesCreateContent() {
  const router = useRouter();
  const { user } = useAuth();
  
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <DocenteForm onSuccess={() => {
        if (user?.role) {
          router.push(`/${user.role}/docentes`);
        }
      }} />
    </div>
  );
}
