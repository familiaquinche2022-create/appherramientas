import React, { useState } from 'react';
import { LogIn, Package, User, MessageSquare, Clock } from 'lucide-react';
import { Movement, User as UserType } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CheckinFormProps {
  activeMovements: Movement[];
  user: UserType;
  onSubmit: (movementId: string, returnQuantity: number, userName: string, notes?: string) => Promise<any>;
}

export const CheckinForm: React.FC<CheckinFormProps> = ({ activeMovements, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    movementId: '',
    quantity: 1,
    userName: user.name,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const selectedMovement = activeMovements.find(m => m.id === formData.movementId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMovement) return;
    
    setLoading(true);

    const { error } = await onSubmit(
      formData.movementId,
      formData.quantity,
      formData.userName,
      formData.notes || undefined
    );

    if (!error) {
      setFormData({
        ...formData,
        movementId: '',
        quantity: 1,
        notes: '',
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <LogIn className="h-5 w-5 text-green-600 mr-2" />
        Registrar Devolución de Herramienta
      </h3>

      {activeMovements.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay herramientas pendientes de devolución</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Movement Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Herramienta a devolver *
            </label>
            <select
              value={formData.movementId}
              onChange={(e) => {
                const movement = activeMovements.find(m => m.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  movementId: e.target.value,
                  quantity: movement?.quantity || 1 
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Seleccione una herramienta</option>
              {activeMovements.map(movement => (
                <option key={movement.id} value={movement.id}>
                  {movement.tool_name} - {movement.user_name} ({movement.quantity} unidades)
                </option>
              ))}
            </select>
          </div>

          {/* Movement Details */}
          {selectedMovement && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Detalles del préstamo:</h4>
              <div className="space-y-1 text-sm">
                <p className="text-blue-800">
                  <User className="inline h-4 w-4 mr-1" />
                  Usuario: {selectedMovement.user_name}
                </p>
                <p className="text-blue-800">
                  Área: {selectedMovement.area}
                </p>
                <p className="text-blue-800">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Fecha de salida: {format(new Date(selectedMovement.checkout_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
                <p className="text-blue-800">
                  Cantidad prestada: {selectedMovement.quantity} unidades
                </p>
                {selectedMovement.notes && (
                  <p className="text-blue-800">
                    Notas: {selectedMovement.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Return Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a devolver *
            </label>
            <input
              type="number"
              min="1"
              max={selectedMovement?.quantity || 1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            {selectedMovement && (
              <p className="text-sm text-gray-500 mt-1">
                Máximo: {selectedMovement.quantity} unidades
              </p>
            )}
          </div>

          {/* Return User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Persona que devuelve *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notas de devolución (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Estado de la herramienta, observaciones, etc..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.movementId}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Registrar Devolución</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};