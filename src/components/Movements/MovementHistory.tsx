import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Search, Calendar, User, Package, Filter } from 'lucide-react';
import { Movement } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MovementHistoryProps {
  movements: Movement[];
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'checkout' | 'checkin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const matchesSearch = movement.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.area.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || movement.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [movements, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <ArrowLeftRight className="h-5 w-5 text-purple-600 mr-2" />
        Historial de Movimientos
      </h3>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'checkout' | 'checkin')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">Todos los tipos</option>
          <option value="checkout">Salidas</option>
          <option value="checkin">Devoluciones</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'returned')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="returned">Devueltos</option>
        </select>

        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          {filteredMovements.length} registro{filteredMovements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Movements List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-8">
            <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron movimientos</p>
          </div>
        ) : (
          filteredMovements.map((movement) => (
            <div
              key={movement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                movement.type === 'checkout'
                  ? movement.status === 'active'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className={`h-4 w-4 ${
                      movement.type === 'checkout' ? 'text-red-600' : 'text-green-600'
                    }`} />
                    <span className="font-medium text-gray-900">
                      {movement.tool_name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      movement.type === 'checkout' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {movement.type === 'checkout' ? 'Salida' : 'Devolución'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      movement.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {movement.status === 'active' ? 'En Uso' : 'Devuelto'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {movement.user_name}
                    </span>
                    <span>{movement.area}</span>
                    <span>Cantidad: {movement.quantity}</span>
                  </div>

                  {movement.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{movement.notes}"
                    </p>
                  )}
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(movement.checkout_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  {movement.checkin_date && (
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Devuelto: {format(new Date(movement.checkin_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};