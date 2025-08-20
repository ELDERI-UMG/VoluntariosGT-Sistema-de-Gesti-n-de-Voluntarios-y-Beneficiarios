# MCP Supabase Server

Este servidor MCP proporciona herramientas avanzadas para gestionar tu base de datos Supabase de VoluntariosGT.

## Funcionalidades

### 🔍 Consultas de Datos
- **query_table**: Consultar datos de cualquier tabla con filtros avanzados
- **count_rows**: Contar filas con filtros opcionales
- **get_table_schema**: Obtener esquema de tablas
- **list_tables**: Listar todas las tablas

### ✏️ Modificación de Datos
- **insert_data**: Insertar nuevos registros
- **update_data**: Actualizar registros existentes
- **delete_data**: Eliminar registros con filtros

### 🎯 Funciones Específicas de VoluntariosGT
- **get_user_stats**: Estadísticas de usuarios (por rol, estado, departamento)
- **get_activity_stats**: Estadísticas de actividades (por estado, categoría, entidad)
- **execute_rpc**: Ejecutar funciones almacenadas

### 🔒 Seguridad
- Soporte para cliente normal (con RLS) y admin (bypass RLS)
- Validación automática de permisos
- Filtros seguros para prevenir inyección SQL

## Ejemplos de Uso

### Consultar usuarios por rol
```json
{
  "table": "perfiles",
  "filters": [
    {"column": "role", "operator": "eq", "value": "voluntario"}
  ],
  "limit": 10
}
```

### Obtener estadísticas de actividades
```json
{
  "group_by": "estado",
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }
}
```

### Insertar nueva entidad
```json
{
  "table": "entidades",
  "data": [
    {
      "nombre": "Nueva ONG",
      "email": "contacto@nuevaong.org",
      "telefono": "12345678"
    }
  ],
  "use_admin": true
}
```

## Configuración

El servidor está configurado en `mcp-config.json` con las credenciales de Supabase:
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY

## Instalación

```bash
cd mcp-supabase
npm install
```

## Ejecución

El servidor se ejecuta automáticamente a través de la configuración MCP de Claude Code.