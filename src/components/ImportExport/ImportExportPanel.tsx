import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tool } from '../../types';
import { importToolsFromExcel, exportToolsToExcel } from '../../lib/excel';
import * as XLSX from 'xlsx';


interface ImportExportPanelProps {
  tools: Tool[];
  onBulkImport: (tools: Omit<Tool, 'id' | 'created_at' | 'updated_at'>[]) => Promise<any>;
}

export const ImportExportPanel: React.FC<ImportExportPanelProps> = ({ tools, onBulkImport }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const data = await importToolsFromExcel(file);
      
      if (data.length === 0) {
        setImportResult({ success: false, message: 'El archivo está vacío o no tiene el formato correcto.' });
        return;
      }

      // Convert Excel data to Tool format
      const newTools: Omit<Tool, 'id' | 'created_at' | 'updated_at'>[] = data.map(row => ({
        name: row.Nombre || '',
        stock: row['Stock disponible'] || 0,
        available_stock: row['Stock disponible'] || 0,
        min_stock: row['Punto minimo'] || 1,
        max_stock: row['Punto maximo'] || 10,
        photo_url: row.Foto || undefined,
        category: row.Categoria || undefined,
        description: row.Descripcion || undefined,
      }));

      // Filter out invalid entries
      const validTools = newTools.filter(tool => tool.name && tool.stock > 0);
      
      if (validTools.length === 0) {
        setImportResult({ 
          success: false, 
          message: 'No se encontraron herramientas válidas en el archivo. Verifique que tenga las columnas "Nombre" y "Stock disponible".' 
        });
        return;
      }

      // Import tools
      const { error } = await onBulkImport(validTools);
      
      if (error) {
        setImportResult({ success: false, message: `Error al importar: ${error.message}` });
      } else {
        setImportResult({ 
          success: true, 
          message: `Importación exitosa: ${validTools.length} herramientas importadas.`,
          count: validTools.length 
        });
      }

    } catch (error) {
      setImportResult({ 
        success: false, 
        message: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    } finally {
      setImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExportTemplate = () => {
  const templateData = [
    {
      'Nombre': 'Taladro Eléctrico',
      'Stock disponible': 5,
      'Punto minimo': 1,
      'Punto maximo': 10,
      'Foto': 'https://ejemplo.com/imagen.jpg',
      'Categoria': 'Herramientas Eléctricas',
      'Descripcion': 'Taladro eléctrico de 600W'
    },
    {
      'Nombre': 'Martillo',
      'Stock disponible': 10,
      'Punto minimo': 2,
      'Punto maximo': 15,
      'Foto': '',
      'Categoria': 'Herramientas Manuales',
      'Descripcion': 'Martillo de acero de 500g'
    }
  ];

  // Usar XLSX directamente
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  XLSX.writeFile(wb, 'plantilla_herramientas_ecuajugos.xlsx');
};

  const handleExportCurrent = () => {
    exportToolsToExcel(tools, `inventario_actual_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Upload className="h-7 w-7 text-blue-600 mr-3" />
          Importar / Exportar Herramientas
        </h2>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 text-green-600 mr-2" />
          Importar desde Excel
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Formato del archivo Excel:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Nombre:</strong> Nombre de la herramienta (obligatorio)</li>
              <li>• <strong>Stock disponible:</strong> Cantidad inicial (obligatorio, número mayor a 0)</li>
              <li>• <strong>Punto minimo:</strong> Stock mínimo recomendado (opcional, por defecto 1)</li>
              <li>• <strong>Punto maximo:</strong> Stock máximo recomendado (opcional, por defecto 10)</li>
              <li>• <strong>Foto:</strong> URL de la imagen (opcional)</li>
              <li>• <strong>Categoria:</strong> Categoría de la herramienta (opcional)</li>
              <li>• <strong>Descripcion:</strong> Descripción adicional (opcional)</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  importing ? 'border-gray-300 bg-gray-50' : 'border-blue-300 bg-blue-50 hover:border-blue-400'
                }`}>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileImport}
                    disabled={importing}
                    className="hidden"
                  />
                  <Upload className={`mx-auto h-8 w-8 mb-2 ${importing ? 'text-gray-400' : 'text-blue-600'}`} />
                  <p className={`text-sm ${importing ? 'text-gray-500' : 'text-blue-700'}`}>
                    {importing ? 'Importando...' : 'Haz clic para seleccionar archivo Excel'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos soportados: .xlsx, .xls
                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportTemplate}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Plantilla</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Descarga una plantilla<br />con ejemplos
              </p>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <p className={`text-sm font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 text-orange-600 mr-2" />
          Exportar a Excel
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">Inventario Actual</h4>
                <p className="text-sm text-orange-800 mb-3">
                  Exporta todas las herramientas con el stock actual y sus detalles.
                </p>
                <button
                  onClick={handleExportCurrent}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Exportar Inventario ({tools.length} herramientas)
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Plantilla Vacía</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Descarga una plantilla con el formato correcto y ejemplos.
                </p>
                <button
                  onClick={handleExportTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Descargar Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-purple-600 mr-2" />
          Instrucciones de Uso
        </h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para importar herramientas:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Descarga la plantilla Excel haciendo clic en "Descargar Plantilla"</li>
              <li>Completa la información de las herramientas siguiendo el formato</li>
              <li>Guarda el archivo y selecciónalo usando el botón "Importar desde Excel"</li>
              <li>Las herramientas se agregarán automáticamente al inventario</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para exportar el inventario:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Haz clic en "Exportar Inventario" para descargar el estado actual</li>
              <li>El archivo incluirá stock total, disponible, en uso y otros detalles</li>
              <li>Puedes modificar el archivo y reimportarlo si es necesario</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-medium">Nota importante:</p>
            <p className="text-yellow-700 text-sm">
              Al importar herramientas que ya existen (mismo nombre), se crearán como entradas separadas. 
              Revisa el inventario después de importar para evitar duplicados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};