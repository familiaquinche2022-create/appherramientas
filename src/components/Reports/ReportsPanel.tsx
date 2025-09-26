import React, { useState } from 'react';
import { BarChart3, Download, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Movement, Tool } from '../../types';
import { exportMovementsToExcel, exportToolsToExcel } from '../../lib/excel';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportsPanelProps {
  movements: Movement[];
  tools: Tool[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ movements, tools }) => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'custom':
        return {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  };

  const { start, end } = getDateRange();
  
  const filteredMovements = movements.filter(movement => {
    const movementDate = new Date(movement.created_at);
    return movementDate >= start && movementDate <= end;
  });

  // Statistics
  const totalMovements = filteredMovements.length;
  const checkouts = filteredMovements.filter(m => m.type === 'checkout').length;
  const checkins = filteredMovements.filter(m => m.type === 'checkin').length;
  const activeLoans = movements.filter(m => m.status === 'active').length;

  // Most used tools
  const toolUsage = tools.map(tool => ({
    ...tool,
    usageCount: movements.filter(m => m.tool_id === tool.id).length
  })).sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);

  // Most active areas
  const areaUsage = filteredMovements.reduce((acc, movement) => {
    acc[movement.area] = (acc[movement.area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAreas = Object.entries(areaUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const handleExportMovements = () => {
    exportMovementsToExcel(
      filteredMovements, 
      `historial_movimientos_${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`
    );
  };

  const handleExportTools = () => {
    exportToolsToExcel(tools, `inventario_herramientas_${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-7 w-7 text-green-600 mr-3" />
          Reportes y Estadísticas
        </h2>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          Período de Análisis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'custom')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleExportMovements}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Movimientos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
              <p className="text-2xl font-bold text-gray-900">{totalMovements}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salidas</p>
              <p className="text-2xl font-bold text-red-600">{checkouts}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">↑</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Devoluciones</p>
              <p className="text-2xl font-bold text-green-600">{checkins}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">↓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Préstamos Activos</p>
              <p className="text-2xl font-bold text-orange-600">{activeLoans}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">⏱</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Tools */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            Herramientas Más Utilizadas
          </h3>
          
          <div className="space-y-3">
            {toolUsage.map((tool, index) => (
              <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{tool.name}</span>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {tool.usageCount} usos
                </span>
              </div>
            ))}
          </div>
          
          {toolUsage.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          )}
        </div>

        {/* Most Active Areas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            Áreas Más Activas
          </h3>
          
          <div className="space-y-3">
            {topAreas.map(([area, count], index) => (
              <div key={area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{area}</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {count} movimientos
                </span>
              </div>
            ))}
          </div>
          
          {topAreas.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Export Tools */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-orange-600 mr-2" />
          Exportar Inventario
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Exportar el inventario completo de herramientas con stock actual y detalles.
          </p>
          <button
            onClick={handleExportTools}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Inventario</span>
          </button>
        </div>
      </div>
    </div>
  );
};