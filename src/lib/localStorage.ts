import { Tool, Movement, User } from '../types';

const STORAGE_KEYS = {
  TOOLS: 'ecuajugos_tools',
  MOVEMENTS: 'ecuajugos_movements',
  USERS: 'ecuajugos_users',
  CURRENT_USER: 'ecuajugos_current_user',
};

// Initialize default data
const initializeDefaultData = () => {
  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      name: 'Administrador',
      role: 'admin',
      area: 'Administración',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'tecnico',
      name: 'Juan Pérez',
      role: 'operator',
      area: 'Técnico',
      created_at: new Date().toISOString(),
    },
  ];

  // Default tools
  const defaultTools: Tool[] = [
    {
      id: '1',
      name: 'Taladro Eléctrico Bosch',
      stock: 3,
      available_stock: 3,
      min_stock: 1,
      max_stock: 5,
      category: 'Herramientas Eléctricas',
      description: 'Taladro eléctrico de 600W con percutor',
      photo_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Juego de Llaves Inglesas',
      stock: 5,
      available_stock: 5,
      min_stock: 2,
      max_stock: 8,
      category: 'Herramientas Manuales',
      description: 'Set de 12 llaves inglesas de 8mm a 24mm',
      photo_url: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Soldadora MIG',
      stock: 1,
      available_stock: 1,
      min_stock: 1,
      max_stock: 2,
      category: 'Equipos de Soldadura',
      description: 'Soldadora MIG/MAG 200A',
      photo_url: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Martillo de Bola',
      stock: 8,
      available_stock: 8,
      min_stock: 3,
      max_stock: 12,
      category: 'Herramientas Manuales',
      description: 'Martillo de bola de 500g con mango de fibra',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Multímetro Digital',
      stock: 2,
      available_stock: 2,
      min_stock: 1,
      max_stock: 3,
      category: 'Instrumentos de Medición',
      description: 'Multímetro digital con pantalla LCD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TOOLS)) {
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(defaultTools));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
  }
};

// User authentication
export const signIn = async (username: string, password: string) => {
  const users = getUsers();
  
  // Simple authentication - in production you'd want proper password hashing
  const validCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'tecnico', password: 'tecnico123' },
  ];

  const isValid = validCredentials.some(cred => cred.username === username && cred.password === password);
  
  if (isValid) {
    const user = users.find(u => u.username === username);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { data: { user }, error: null };
    }
  }
  
  return { data: null, error: new Error('Credenciales inválidas') };
};

export const signOut = async () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  return { error: null };
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

// Tools
export const getTools = (): Tool[] => {
  const toolsStr = localStorage.getItem(STORAGE_KEYS.TOOLS);
  return toolsStr ? JSON.parse(toolsStr) : [];
};

export const saveTools = (tools: Tool[]) => {
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools));
};

export const addTool = (tool: Omit<Tool, 'id' | 'created_at' | 'updated_at'>) => {
  const tools = getTools();
  const newTool: Tool = {
    ...tool,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  tools.push(newTool);
  saveTools(tools);
  return { data: newTool, error: null };
};

export const updateTool = (id: string, updates: Partial<Tool>) => {
  const tools = getTools();
  const index = tools.findIndex(t => t.id === id);
  if (index !== -1) {
    tools[index] = { ...tools[index], ...updates, updated_at: new Date().toISOString() };
    saveTools(tools);
    return { data: tools[index], error: null };
  }
  return { data: null, error: new Error('Herramienta no encontrada') };
};

export const deleteTool = (id: string) => {
  const tools = getTools();
  const filteredTools = tools.filter(t => t.id !== id);
  saveTools(filteredTools);
  return { error: null };
};

// Movements
export const getMovements = (): Movement[] => {
  const movementsStr = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
  return movementsStr ? JSON.parse(movementsStr) : [];
};

export const saveMovements = (movements: Movement[]) => {
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
};

export const addMovement = (movement: Omit<Movement, 'id' | 'created_at'>) => {
  const movements = getMovements();
  const newMovement: Movement = {
    ...movement,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  movements.push(newMovement);
  saveMovements(movements);
  return { data: newMovement, error: null };
};

export const updateMovement = (id: string, updates: Partial<Movement>) => {
  const movements = getMovements();
  const index = movements.findIndex(m => m.id === id);
  if (index !== -1) {
    movements[index] = { ...movements[index], ...updates };
    saveMovements(movements);
    return { data: movements[index], error: null };
  }
  return { data: null, error: new Error('Movimiento no encontrado') };
};

// Users
export const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
};

// Initialize data on first load
initializeDefaultData();