import React, { useState, useMemo } from 'react';
import { Search, Filter, Package, CreditCard as Edit3, Trash2, Plus, Eye } from 'lucide-react';
import { Tool, ToolUsage, User } from '../../types';
import { AddToolModal } from './AddToolModal';
import { EditToolModal } from './EditToolModal';
import { ToolDetailModal } from './ToolDetailModal';

interface InventoryTableProps {
  tools: Tool[];
  toolsInUse: ToolUsage[];
  user: User;
  onAddTool: (tool: Omit<Tool, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateTool: (id: string, updates: Partial<Tool>) => Promise<any>;
  onDeleteTool: (id: string) => Promise<any>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  tools,
  toolsInUse,
  user,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'available_stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [viewingTool, setViewingTool] = useState<Tool | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = tools.map(tool => tool.category || 'Sin categoría');
    return [...new Set(cats)];
  }, [tools]);

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || (tool.category || 'Sin categoría') === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tools, searchTerm, categoryFilter, sortBy, sortOrder]);

  const getToolUsage = (toolId: string) => {
    return toolsInUse.filter(usage => usage.tool_id === toolId);
  };

  const handleSort = (field: 'name' | 'stock' | 'available_stock') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="h-7 w-7 text-blue-600 mr-3" />
          Inventario de Herramientas
        </h2>
        
        {user.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Herramienta</span>
          </button>
        )}
        
        {user.role === 'admin' && (
          <button
            onClick={() => {
              if (confirm('¿Está seguro de que desea eliminar TODAS las herramientas? Esta acción no se puede deshacer.')) {
                tools.forEach(tool => onDeleteTool(tool.id));
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar Todo</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'available_stock')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Ordenar por Nombre</option>
              <option value="stock">Ordenar por Stock Total</option>
              <option value="available_stock">Ordenar por Disponible</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Herramienta
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En Uso Por
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedTools.map((tool) => {
                const usage = getToolUsage(tool.id);
                const inUse = tool.stock - tool.available_stock;
                
                return (
                  <tr key={tool.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {tool.photo_url ? (
                          <img
                            src={tool.photo_url}
                            alt={tool.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{tool.name}</p>
                          <p className="text-sm text-gray-500">{tool.category || 'Sin categoría'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Disponible: {tool.available_stock}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: {tool.stock}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tool.available_stock === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sin Stock
                        </span>
                      ) : tool.available_stock <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Stock Bajo
                        </span>
                      ) : inUse > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          En Uso Parcial
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {usage.length > 0 ? (
                        <div className="space-y-1">
                          {usage.slice(0, 2).map((u, index) => (
                            <p key={index} className="text-sm text-gray-600">
                              {u.user_name} ({u.quantity} unid.) - {u.area}
                            </p>
                          ))}
                          {usage.length > 2 && (
                            <p className="text-xs text-gray-400">
                              +{usage.length - 2} más...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Ninguno</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setViewingTool(tool)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {user.role === 'admin' && (
                          <>
                            <button
                              onClick={() => setEditingTool(tool)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Está seguro de que desea eliminar esta herramienta?')) {
                                  onDeleteTool(tool.id);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedTools.length === 0 && (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron herramientas</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddToolModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddTool}
        />
      )}

      {editingTool && (
        <EditToolModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onUpdate={onUpdateTool}
        />
      )}

      {viewingTool && (
        <ToolDetailModal
          tool={viewingTool}
          toolsInUse={getToolUsage(viewingTool.id)}
          onClose={() => setViewingTool(null)}
        />
      )}
    </div>
  );
};