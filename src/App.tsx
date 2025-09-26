import React, { useState, useEffect, useMemo } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Dashboard } from './components/Dashboard/Dashboard';
import { InventoryTable } from './components/Inventory/InventoryTable';
import { MovementsPanel } from './components/Movements/MovementsPanel';
import { ReportsPanel } from './components/Reports/ReportsPanel';
import { ImportExportPanel } from './components/ImportExport/ImportExportPanel';
import { useAuth } from './hooks/useAuth';
import { useTools } from './hooks/useTools';
import { useMovements } from './hooks/useMovements';
import { DashboardStats, Tool } from './types';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { tools, toolsInUse, loading: toolsLoading, addTool, updateTool, deleteTool } = useTools();
  const { movements, loading: movementsLoading, createCheckout, createCheckin } = useMovements();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Force re-render when user changes
  const [, forceUpdate] = useState({});
  
  const handleAuthSuccess = () => {
    forceUpdate({});
  };

  // Calculate dashboard stats
  const stats: DashboardStats = useMemo(() => {
    const totalTools = tools.length;
    const toolsInUseCount = toolsInUse.length;
    const totalMovements = movements.length;
    const availableTools = tools.reduce((sum, tool) => sum + tool.available_stock, 0);

    return {
      totalTools,
      toolsInUse: toolsInUseCount,
      totalMovements,
      availableTools,
    };
  }, [tools, toolsInUse, movements]);

  const recentMovements = movements.slice(0, 10);

  const handleBulkImport = async (toolsData: Omit<Tool, 'id' | 'created_at' | 'updated_at'>[]) => {
    const results = await Promise.allSettled(
      toolsData.map(tool => addTool(tool))
    );
    
    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length > 0) {
      return { error: new Error(`${errors.length} herramientas fallaron al importar`) };
    }
    
    return { error: null };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSuccess={handleAuthSuccess} />;
  }

  const loading = toolsLoading || movementsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={() => {}} />
      
      <div className="flex">
        <div className="w-64 min-h-screen">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            user={user}
          />
        </div>
        
        <main className="flex-1 p-6">
          {loading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 text-sm">Cargando datos...</span>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              tools={tools}
              toolsInUse={toolsInUse}
              recentMovements={recentMovements}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTable
              tools={tools}
              toolsInUse={toolsInUse}
              user={user}
              onAddTool={addTool}
              onUpdateTool={updateTool}
              onDeleteTool={deleteTool}
            />
          )}

          {activeTab === 'movements' && (
            <MovementsPanel
              tools={tools}
              movements={movements}
              user={user}
              onCheckout={createCheckout}
              onCheckin={createCheckin}
            />
          )}

          {activeTab === 'reports' && user.role === 'admin' && (
            <ReportsPanel
              movements={movements}
              tools={tools}
            />
          )}

          {activeTab === 'import-export' && user.role === 'admin' && (
            <ImportExportPanel
              tools={tools}
              onBulkImport={handleBulkImport}
            />
          )}

          {activeTab === 'settings' && user.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
              <p className="text-gray-600">Panel de configuración en desarrollo...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;