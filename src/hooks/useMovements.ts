import { useState, useEffect } from 'react';
import { Movement } from '../types';
import { getMovements, addMovement, updateMovement, getTools, saveTools } from '../lib/localStorage';

export const useMovements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      const data = getMovements().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMovements(data);
    } catch (error) {
      console.error('Error fetching movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (
    toolId: string,
    toolName: string,
    quantity: number,
    userName: string,
    area: string,
    notes?: string
  ) => {
    try {
      const tools = getTools();
      const tool = tools.find(t => t.id === toolId);

      if (!tool || tool.available_stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      const { data, error } = addMovement({
        tool_id: toolId,
        tool_name: toolName,
        type: 'checkout',
        quantity,
        user_name: userName,
        area,
        notes,
        checkout_date: new Date().toISOString(),
        status: 'active',
      });

      if (!error) {
        // Update tool available stock
        tool.available_stock -= quantity;
        saveTools(tools);
      }

      await fetchMovements();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const createCheckin = async (movementId: string, returnQuantity: number, userName: string, notes?: string) => {
    try {
      const movements = getMovements();
      const movement = movements.find(m => m.id === movementId);

      if (!movement) throw new Error('Movimiento no encontrado');

      // Update the original movement
      updateMovement(movementId, {
        status: 'returned',
        checkin_date: new Date().toISOString(),
      });

      // Create a new checkin movement
      const { data, error } = addMovement({
        tool_id: movement.tool_id,
        tool_name: movement.tool_name,
        type: 'checkin',
        quantity: returnQuantity,
        user_name: userName,
        area: movement.area,
        notes,
        checkout_date: movement.checkout_date,
        checkin_date: new Date().toISOString(),
        status: 'returned',
      });

      // Update tool available stock
      const tools = getTools();
      const tool = tools.find(t => t.id === movement.tool_id);
      if (tool) {
        tool.available_stock += returnQuantity;
        saveTools(tools);
      }

      await fetchMovements();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    loading,
    createCheckout,
    createCheckin,
    refetch: fetchMovements,
  };
};