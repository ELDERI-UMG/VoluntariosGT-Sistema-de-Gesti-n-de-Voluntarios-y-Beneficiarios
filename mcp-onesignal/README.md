# OneSignal MCP Server

Un servidor MCP (Model Context Protocol) para interactuar completamente con la API de OneSignal.

## Funcionalidades

### Notificaciones
- `create_notification` - Crear y enviar notificaciones push
- `get_notifications` - Obtener lista de notificaciones
- `get_notification` - Obtener detalles de una notificación específica
- `cancel_notification` - Cancelar notificación programada

### Aplicaciones
- `get_apps` - Obtener lista de todas las apps
- `get_app` - Obtener detalles de una app específica
- `create_app` - Crear nueva app de OneSignal
- `update_app` - Actualizar configuración de app

### Usuarios/Dispositivos
- `get_players` - Obtener lista de dispositivos
- `get_player` - Obtener detalles de dispositivo específico

### Segmentos
- `create_segment` - Crear nuevo segmento
- `get_segments` - Obtener lista de segmentos

## Configuración

1. Obtén tus API keys de OneSignal:
   - Ve a https://dashboard.onesignal.com/apps
   - Selecciona tu app
   - Ve a Settings > Keys & IDs

2. Crea el archivo `.env`:
   ```bash
   cp .env.example .env
   ```

3. Configura tus API keys en `.env`:
   ```
   ONESIGNAL_REST_API_KEY=tu_rest_api_key
   ONESIGNAL_USER_AUTH_KEY=tu_user_auth_key
   ```

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

## Ejemplos de uso

### Enviar notificación
```json
{
  "app_id": "tu-app-id",
  "contents": {
    "en": "Hello World!",
    "es": "¡Hola Mundo!"
  },
  "headings": {
    "en": "New Message",
    "es": "Nuevo Mensaje"
  },
  "included_segments": ["All"]
}
```

### Crear segmento
```json
{
  "app_id": "tu-app-id",
  "name": "Usuarios Activos",
  "filters": [
    {
      "field": "last_session",
      "relation": ">",
      "hours_ago": 72
    }
  ]
}
```