'use client'

import { useAuth } from '../../hooks/use-auth';
import { logoutAction } from '@/modules/auth/presentation/actions/logout.action';
import { Button } from '../ui/button';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName || 'Usuario'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600 font-semibold uppercase mt-1">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/perfil'}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/cambiar-password'}>
                Cambiar Contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutAction()} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
