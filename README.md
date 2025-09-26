# Sistema de Control de Herramientas - Ecuajugos S.A.

## Características
- ✅ **Sin dependencias externas**: Funciona completamente offline usando localStorage
- ✅ **Importación desde Excel**: Carga masiva de herramientas desde archivos Excel
- ✅ **Exportación a Excel**: Genera reportes de inventario y movimientos
- ✅ **Control de stock**: Seguimiento en tiempo real de herramientas disponibles
- ✅ **Historial completo**: Registro de todas las salidas y devoluciones
- ✅ **Roles de usuario**: Administrador y Operario con permisos diferenciados
- ✅ **Interfaz intuitiva**: Diseño moderno y fácil de usar
## Descripción
## Credenciales de Acceso
- **Administrador**: admin@ecuajugos.com / admin123
- **Operario**: operario@ecuajugos.com / operario123
Aplicación web para el control y gestión de herramientas en talleres mecánicos. Diseñada para equipos pequeños (hasta 20 personas) con uso esporádico.
## Instalación y Uso
1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. Abre tu navegador en `http://localhost:5173`
## Funcionalidades Principales
### Para Administradores
- Gestión completa del inventario (agregar, editar, eliminar herramientas)
- Importación masiva desde Excel
- Exportación de reportes
- Control de movimientos (salidas y devoluciones)
- Estadísticas y reportes detallados
### Para Operarios
- Consulta del inventario
- Registro de salidas y devoluciones de herramientas
- Visualización del historial de movimientos
## Almacenamiento de Datos
Los datos se almacenan localmente en el navegador usando localStorage. Esto significa:
- ✅ No requiere conexión a internet
- ✅ No hay costos de base de datos
- ✅ Funciona completamente offline
- ⚠️ Los datos están vinculados al navegador específico
- ⚠️ Se recomienda hacer respaldos regulares exportando a Excel
## Tecnologías Utilizadas
- React 18 con TypeScript
- Tailwind CSS para estilos
- Lucide React para iconos
- XLSX para manejo de archivos Excel
- Vite como bundler
## Estructura del Proyecto
```
src/
├── components/          # Componentes React
├── hooks/              # Custom hooks
├── lib/                # Utilidades y lógica de negocio
├── types/              # Definiciones de TypeScript
└── App.tsx             # Componente principal
```
## Respaldo de Datos
Para respaldar los datos:
1. Ve a la sección "Reportes"
2. Exporta el inventario completo
3. Exporta el historial de movimientos
4. Guarda estos archivos como respaldo
Para restaurar datos:
1. Ve a "Importar/Exportar"
2. Usa la plantilla Excel para importar herramientas
3. Los movimientos se pueden recrear manualmente si es necesario