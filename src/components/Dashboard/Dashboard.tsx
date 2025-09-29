import React from 'react';
import { Package, Users, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardStats, Tool, ToolUsage, Movement } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardProps {
  stats: DashboardStats;
  tools: Tool[];
  toolsInUse: ToolUsage[];
  recentMovements: Movement[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  tools, 
  toolsInUse, 
  recentMovements 
}) => {
  const lowStockTools = tools.filter(tool => {
    const minStock = tool.min_stock || 1;
    return tool.available_stock <= minStock && tool.available_stock > 0;
  });
  const outOfStockTools = tools.filter(tool => tool.available_stock === 0);
  
  // Check for overdue tools (more than 2 days)
  const overdueTools = toolsInUse.filter(usage => {
    const checkoutDate = new Date(usage.checkout_date);
    const now = new Date();
    const diffInDays = (now.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 2;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Herramientas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTools}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Uso</p>
              <p className="text-2xl font-bold text-orange-600">{stats.toolsInUse}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableTools}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Movimientos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMovements}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools in Use */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            Herramientas en Uso
          </h3>
          
          {toolsInUse.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay herramientas en uso</p>
          ) : (
            <div className="space-y-3">
              {toolsInUse.slice(0, 5).map((usage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{usage.tool_name}</p>
                    <p className="text-sm text-gray-600">
                      {usage.user_name} - {usage.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {usage.quantity} unidad{usage.quantity > 1 ? 'es' : ''}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(usage.checkout_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            Últimos Movimientos
          </h3>
          
          {recentMovements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay movimientos recientes</p>
          ) : (
            <div className="space-y-3">
              {recentMovements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{movement.tool_name}</p>
                    <p className="text-sm text-gray-600">
                      {movement.user_name} - {movement.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      movement.type === 'checkout' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {movement.type === 'checkout' ? 'Salida' : 'Devolución'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(lowStockTools.length > 0 || outOfStockTools.length > 0 || overdueTools.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Alertas del Sistema
          </h3>
          
          <div className="space-y-4">
            {overdueTools.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Herramientas Vencidas (Más de 2 días)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {overdueTools.map((usage, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900">{usage.tool_name}</p>
                      <p className="text-sm text-red-600">Usuario: {usage.user_name}</p>
                      <p className="text-sm text-red-600">Área: {usage.area}</p>
                      <p className="text-sm text-red-600">
                        Salida: {format(new Date(usage.checkout_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                      <p className="text-sm text-red-600">
                        Días vencido: {Math.floor((new Date().getTime() - new Date(usage.checkout_date).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {outOfStockTools.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Sin Stock</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {outOfStockTools.map((tool) => (
                    <div key={tool.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900">{tool.name}</p>
                      <p className="text-sm text-red-600">Stock: {tool.available_stock}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {lowStockTools.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-800 mb-2">Stock Bajo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockTools.map((tool) => (
                    <div key={tool.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-medium text-orange-900">{tool.name}</p>
                      <p className="text-sm text-orange-600">
                        Stock: {tool.available_stock} / Mínimo: {tool.min_stock || 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};