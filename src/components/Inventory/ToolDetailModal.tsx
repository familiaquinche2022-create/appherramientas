import React from 'react';
import { X, Package, Calendar, User, MapPin } from 'lucide-react';
import { Tool, ToolUsage } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ToolDetailModalProps {
  tool: Tool;
  toolsInUse: ToolUsage[];
  onClose: () => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, toolsInUse, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-2" />
            Detalles de la Herramienta
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tool Image */}
          <div>
            {tool.photo_url ? (
              <img
                src={tool.photo_url}
                alt={tool.name}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Tool Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
              <p className="text-gray-600">{tool.category || 'Sin categoría'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Stock Total</p>
                <p className="text-lg font-semibold text-gray-900">{tool.stock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="text-lg font-semibold text-green-600">{tool.available_stock}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">En Uso</p>
              <p className="text-lg font-semibold text-orange-600">{tool.stock - tool.available_stock}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="text-gray-900">
                {format(new Date(tool.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>

            {tool.description && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Descripción</p>
                <p className="text-gray-900">{tool.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Currently in use */}
        {toolsInUse.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              Actualmente en Uso
            </h4>
            
            <div className="space-y-3">
              {toolsInUse.map((usage, index) => (
                <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center">
                        <User className="h-4 w-4 text-gray-600 mr-2" />
                        {usage.user_name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {usage.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-800">
                        {usage.quantity} unidad{usage.quantity > 1 ? 'es' : ''}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {format(new Date(usage.checkout_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};