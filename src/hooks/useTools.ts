import { useState, useEffect } from 'react';
import { Tool, ToolUsage } from '../types';
import { supabase } from '../lib/supabase';

export const useTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsInUse, setToolsInUse] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchToolsInUse = async () => {
    try {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('status', 'active')
        .order('checkout_date', { ascending: false });

      if (error) throw error;
      
      const usage = (data || []).map(movement => ({
        tool_id: movement.tool_id,
        tool_name: movement.tool_name,
        user_name: movement.user_name,
        area: movement.area,
        quantity: movement.quantity,
        checkout_date: movement.checkout_date,
        movement_id: movement.id,
      }));
      
      setToolsInUse(usage);
    } catch (error) {
      console.error('Error fetching tools in use:', error);
    }
  };

  const addTool = async (tool: Omit<Tool, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .insert([{ ...tool, available_stock: tool.stock }])
        .select()
        .single();

      if (error) throw error;
      await fetchTools();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateTool = async (id: string, updates: Partial<Tool>) => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTools();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTools();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTools(), fetchToolsInUse()]);
      setLoading(false);
    };

    loadData();

    // Subscribe to real-time updates
    const toolsSubscription = supabase
      .channel('tools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        fetchTools();
      })
      .subscribe();

    const movementsSubscription = supabase
      .channel('movements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, () => {
        fetchToolsInUse();
        fetchTools();
      })
      .subscribe();

    return () => {
      toolsSubscription.unsubscribe();
      movementsSubscription.unsubscribe();
    };
  }, []);

  return {
    tools,
    toolsInUse,
    loading,
    addTool,
    updateTool,
    deleteTool,
    refetch: () => Promise.all([fetchTools(), fetchToolsInUse()]),
  };
};