import { useState, useEffect } from 'react';
import { Tool, ToolUsage } from '../types';
import { getTools, getMovements, addTool as addToolToStorage, updateTool as updateToolInStorage, deleteTool as deleteToolFromStorage } from '../lib/localStorage';

export const useTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsInUse, setToolsInUse] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const data = getTools();
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchToolsInUse = async () => {
    try {
      const movements = getMovements();
      const activeMovements = movements.filter(m => m.status === 'active' && m.type === 'checkout');
      
      const usage = activeMovements.map(movement => ({
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
      const result = addToolToStorage({ ...tool, available_stock: tool.stock });
      await fetchTools();
      return result;
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateTool = async (id: string, updates: Partial<Tool>) => {
    try {
      const result = updateToolInStorage(id, updates);
      await fetchTools();
      return result;
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const result = deleteToolFromStorage(id);
      await fetchTools();
      return result;
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