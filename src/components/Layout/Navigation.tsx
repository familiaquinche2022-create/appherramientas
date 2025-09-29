import React from 'react';
import { Home, Package, ArrowLeftRight, BarChart3, Settings, Upload, Download } from 'lucide-react';
import { User } from '../../types';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: Home, allowed: ['admin', 'operator'] },
    { id: 'inventory', label: 'Inventario', icon: Package, allowed: ['admin', 'operator'] },
    { id: 'movements', label: 'Movimientos', icon: ArrowLeftRight, allowed: ['admin', 'operator'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, allowed: ['admin'] },
    { id: 'import-export', label: 'Importar/Exportar', icon: Upload, allowed: ['admin'] },
    { id: 'settings', label: 'Configuración', icon: Settings, allowed: ['admin'] },
  ];

  // Filter items based on user role
  const allowedItems = navItems.filter(item => item.allowed.includes(user.role));

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200">
      <div className="p-4">
        <ul className="space-y-2">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};