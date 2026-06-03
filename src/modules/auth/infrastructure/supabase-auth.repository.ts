import { IAuthRepository } from '../domain/repositories/auth.repository';
import { User } from '../domain/entities/user.entity';
import { LoginDTO } from '../application/dtos/login.dto';
import { RecoverPasswordDTO } from '../application/dtos/recover-password.dto';
import { ChangePasswordDTO } from '../application/dtos/change-password.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { UserRole } from '@/shared/types';

export class SupabaseAuthRepository implements IAuthRepository {
  async login(dto: LoginDTO): Promise<User> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      if (error?.message?.includes('fetch failed')) {
        throw new Error(
          'No se pudo conectar a Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y la conexión de red.'
        );
      }

      throw new Error(error?.message || 'Credenciales inválidas');
    }

    const userRole = (data.user.user_metadata?.role as UserRole) || 'docente';
    
    return {
      id: data.user.id,
      email: data.user.email!,
      role: userRole,
      fullName: data.user.user_metadata?.full_name,
    };
  }

  async logout(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getSessionUser(): Promise<User | null> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const userRole = (user.user_metadata?.role as UserRole) || 'docente';

    return {
      id: user.id,
      email: user.email!,
      role: userRole,
      fullName: user.user_metadata?.full_name,
    };
  }

  async recoverPassword(dto: RecoverPasswordDTO): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(dto.email, {
      // Redirect URL will need to be configured based on the environment
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cambiar-password`,
    });

    if (error) {
      throw new Error('No se pudo enviar el correo de recuperación');
    }
  }

  async changePassword(dto: ChangePasswordDTO): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: dto.newPassword
    });

    if (error) {
      throw new Error('No se pudo cambiar la contraseña');
    }
    
    // Al cambiar, cerrar sesión por seguridad
    await supabase.auth.signOut();
  }
}
