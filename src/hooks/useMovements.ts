import { useState, useEffect } from 'react';
import { Movement } from '../types';
import { supabase } from '../lib/supabase';

export const useMovements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured - using empty movements list');
        setMovements([]);
        return;
      }

      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovements(data || []);
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
      if (!supabase) {
        return { data: null, error: new Error('Supabase not configured') };
      }

      // First, update tool stock
      const { data: tool } = await supabase
        .from('tools')
        .select('available_stock')
        .eq('id', toolId)
        .single();

      if (!tool || tool.available_stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      const { data, error } = await supabase
        .from('movements')
        .insert([{
          tool_id: toolId,
          tool_name: toolName,
          type: 'checkout',
          quantity,
          user_name: userName,
          area,
          notes,
          checkout_date: new Date().toISOString(),
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;

      // Update tool available stock
      await supabase
        .from('tools')
        .update({ available_stock: tool.available_stock - quantity })
        .eq('id', toolId);

      await fetchMovements();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const createCheckin = async (movementId: string, returnQuantity: number, userName: string, notes?: string) => {
    try {
      if (!supabase) {
        return { data: null, error: new Error('Supabase not configured') };
      }

      // Get the original movement
      const { data: movement } = await supabase
        .from('movements')
        .select('*')
        .eq('id', movementId)
        .single();

      if (!movement) throw new Error('Movimiento no encontrado');

      // Update the original movement
      await supabase
        .from('movements')
        .update({
          status: 'returned',
          checkin_date: new Date().toISOString(),
        })
        .eq('id', movementId);

      // Create a new checkin movement
      const { data, error } = await supabase
        .from('movements')
        .insert([{
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
        }])
        .select()
        .single();

      if (error) throw error;

      // Update tool available stock
      const { data: tool } = await supabase
        .from('tools')
        .select('available_stock')
        .eq('id', movement.tool_id)
        .single();

      if (tool) {
        await supabase
          .from('tools')
          .update({ available_stock: tool.available_stock + returnQuantity })
          .eq('id', movement.tool_id);
      }

      await fetchMovements();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchMovements();

    if (!supabase) {
      return;
    }

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('movements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, () => {
        fetchMovements();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    movements,
    loading,
    createCheckout,
    createCheckin,
    refetch: fetchMovements,
  };
};