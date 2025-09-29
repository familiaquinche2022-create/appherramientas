export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator';
  area: string;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  stock: number;
  available_stock: number;
  min_stock?: number;
  max_stock?: number;
  photo_url?: string;
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  tool_id: string;
  tool_name: string;
  type: 'checkout' | 'checkin';
  quantity: number;
  user_name: string;
  area: string;
  notes?: string;
  checkout_date: string;
  checkin_date?: string;
  status: 'active' | 'returned';
  created_at: string;
}

export interface ToolUsage {
  tool_id: string;
  tool_name: string;
  user_name: string;
  area: string;
  quantity: number;
  checkout_date: string;
  movement_id: string;
}

export interface ExcelRow {
  Nombre: string;
  'Stock disponible': number;
  'Punto minimo'?: number;
  'Punto maximo'?: number;
  Foto?: string;
  Categoria?: string;
  Descripcion?: string;
}

export interface DashboardStats {
  totalTools: number;
  toolsInUse: number;
  totalMovements: number;
  availableTools: number;
}