import React, { useState } from 'react';
import { LogOut, Package, User, MapPin, MessageSquare } from 'lucide-react';
import { Tool, User as UserType } from '../../types';

interface CheckoutFormProps {
  tools: Tool[];
  user: UserType;
  onSubmit: (toolId: string, toolName: string, quantity: number, userName: string, area: string, notes?: string) => Promise<any>;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ tools, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    toolId: '',
    toolSearch: '',
    quantity: 1,
    userName: user.name,
    area: user.area,
    notes: '',
  });
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter tools that have available stock
  const availableTools = tools.filter(tool => tool.available_stock > 0);
  
  // Filter tools by search term
  const searchedTools = availableTools.filter(tool => 
    tool.name.toLowerCase().includes(formData.toolSearch.toLowerCase())
  );

  const selectedTool = tools.find(t => t.id === formData.toolId);
  const maxQuantity = selectedTool?.available_stock || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTool) return;
    
    setLoading(true);

    const { error } = await onSubmit(
      formData.toolId,
      selectedTool.name,
      formData.quantity,
      formData.userName,
      formData.area,
      formData.notes || undefined
    );

    if (!error) {
      setFormData({
        ...formData,
        toolId: '',
        toolSearch: '',
        quantity: 1,
        notes: '',
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <LogOut className="h-5 w-5 text-red-600 mr-2" />
        Registrar Salida de Herramienta
      </h3>

      {availableTools.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay herramientas disponibles</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tool Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Herramienta *
            </label>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !showSearch 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showSearch 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Buscar
                </button>
              </div>
              
              {showSearch ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar herramienta por nombre..."
                    value={formData.toolSearch}
                    onChange={(e) => setFormData({ ...formData, toolSearch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <select
                    value={formData.toolId}
                    onChange={(e) => {
                      setFormData({ ...formData, toolId: e.target.value, quantity: 1 });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Seleccione una herramienta</option>
                    {searchedTools.map(tool => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name} (Disponible: {tool.available_stock})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <select
                  value={formData.toolId}
                  onChange={(e) => {
                    setFormData({ ...formData, toolId: e.target.value, quantity: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Seleccione una herramienta</option>
                  {availableTools.map(tool => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name} (Disponible: {tool.available_stock})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            {selectedTool && (
              <p className="text-sm text-gray-500 mt-1">
                Máximo disponible: {maxQuantity}
              </p>
            )}
          </div>

          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Persona que retira *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Área o Departamento *
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Notas adicionales sobre el préstamo..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.toolId}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Registrar Salida</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};