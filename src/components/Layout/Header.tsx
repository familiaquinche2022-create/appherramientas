import React from 'react';
import { LogOut, Settings, User, Package, Wrench } from 'lucide-react';
import { User as UserType } from '../../types';
import { signOut } from '../../lib/localStorage';

interface HeaderProps {
  user: UserType;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img 
                src="https://ecuajugos.com/wp-content/uploads/2019/06/ecuajugos-color@2xv1.png" 
                alt="Ecuajugos Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Control de Herramientas
              </h1>
              <p className="text-sm text-gray-600">
                Ecuajugos S.A. - Grupo Gloria
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400 hidden sm:block">
              Desarrollado por Dennis Quinche
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === 'admin' ? 'Administrador' : 'Operario'} - {user.area}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};