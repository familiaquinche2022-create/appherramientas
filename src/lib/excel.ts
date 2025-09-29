import * as XLSX from 'xlsx';
import { Tool, Movement, ExcelRow } from '../types';

export const importToolsFromExcel = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsBinaryString(file);
  });
};

export const exportToolsToExcel = (tools: Tool[], filename: string = 'herramientas_ecuajugos') => {
  const data = tools.map(tool => ({
    'Nombre': tool.name,
    'Stock Total': tool.stock,
    'Stock Disponible': tool.available_stock,
    'En Uso': tool.stock - tool.available_stock,
    'Punto Minimo': tool.min_stock || 1,
    'Punto Maximo': tool.max_stock || 10,
    'Categoria': tool.category || '',
    'Descripcion': tool.description || '',
    'Foto': tool.photo_url || '',
    'Fecha Creacion': new Date(tool.created_at).toLocaleDateString('es-ES'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Herramientas');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportMovementsToExcel = (movements: Movement[], filename: string = 'historial_movimientos') => {
  const data = movements.map(movement => ({
    'Herramienta': movement.tool_name,
    'Tipo': movement.type === 'checkout' ? 'Salida' : 'Devolucion',
    'Cantidad': movement.quantity,
    'Usuario': movement.user_name,
    'Area': movement.area,
    'Fecha Salida': new Date(movement.checkout_date).toLocaleDateString('es-ES'),
    'Hora Salida': new Date(movement.checkout_date).toLocaleTimeString('es-ES'),
    'Fecha Devolucion': movement.checkin_date ? new Date(movement.checkin_date).toLocaleDateString('es-ES') : '',
    'Hora Devolucion': movement.checkin_date ? new Date(movement.checkin_date).toLocaleTimeString('es-ES') : '',
    'Estado': movement.status === 'active' ? 'En Uso' : 'Devuelto',
    'Notas': movement.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};