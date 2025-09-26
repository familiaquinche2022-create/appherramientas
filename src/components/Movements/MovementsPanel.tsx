import React, { useState } from 'react';
import { ArrowLeftRight, LogOut, LogIn } from 'lucide-react';
import { Tool, Movement, User } from '../../types';
import { CheckoutForm } from './CheckoutForm';
import { CheckinForm } from './CheckinForm';
import { MovementHistory } from './MovementHistory';

interface MovementsPanelProps {
  tools: Tool[];
  movements: Movement[];
  user: User;
  onCheckout: (toolId: string, toolName: string, quantity: number, userName: string, area: string, notes?: string) => Promise<any>;
  onCheckin: (movementId: string, returnQuantity: number, userName: string, notes?: string) => Promise<any>;
}

export const MovementsPanel: React.FC<MovementsPanelProps> = ({
  tools,
  movements,
  user,
  onCheckout,
  onCheckin,
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin' | 'history'>('checkout');

  // Get active movements (tools currently checked out)
  const activeMovements = movements.filter(m => m.status === 'active' && m.type === 'checkout');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ArrowLeftRight className="h-7 w-7 text-purple-600 mr-3" />
          Control de Movimientos
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'checkout'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>Registrar Salida</span>
          </button>
          
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'checkin'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Registrar Devolución</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Historial</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'checkout' && (
          <CheckoutForm
            tools={tools}
            user={user}
            onSubmit={onCheckout}
          />
        )}
        
        {activeTab === 'checkin' && (
          <CheckinForm
            activeMovements={activeMovements}
            user={user}
            onSubmit={onCheckin}
          />
        )}
        
        {activeTab === 'history' && (
          <MovementHistory movements={movements} />
        )}
      </div>
    </div>
  );
};