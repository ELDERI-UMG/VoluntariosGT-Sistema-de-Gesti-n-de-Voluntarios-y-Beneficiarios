# Backend - Sistema de Gestión de Voluntarios y Beneficiarios

Este es el backend de la aplicación de gestión de voluntarios y beneficiarios para Guatemala, desarrollado con Node.js, Express.js y Supabase.

## 🚀 Características

- **Autenticación segura** con Supabase Auth y JWT
- **Base de datos PostgreSQL** con Row Level Security (RLS)
- **Geolocalización** con búsqueda por proximidad
- **Generación automática de certificados** en PDF
- **Sistema de notificaciones** con OneSignal
- **Reportes y estadísticas** completos
- **API RESTful** bien documentada
- **Seguridad robusta** con validaciones y encriptación

## 📋 Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Cuenta en Supabase
- Cuenta en OneSignal (opcional, para notificaciones push)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/voluntarios-app.git
cd voluntarios-app/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Configuración de Supabase
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Configuración del servidor
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_aqui

# OneSignal Configuration (opcional)
ONESIGNAL_APP_ID=tu_onesignal_app_id
ONESIGNAL_REST_API_KEY=tu_onesignal_rest_api_key

# Configuración de encriptación
ENCRYPTION_KEY=tu_clave_de_encriptacion_aes256_aqui
```

4. **Configurar Supabase**

Ejecutar las migraciones SQL en tu proyecto de Supabase:
- `supabase/migrations/001_create_initial_tables.sql`
- `supabase/migrations/002_row_level_security.sql`
- `supabase/migrations/003_functions_and_triggers.sql`

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/     # Lógica de negocio
│   │   ├── authController.js
│   │   ├── actividadesController.js
│   │   ├── usuariosController.js
│   │   ├── certificadosController.js
│   │   ├── notificacionesController.js
│   │   └── reportesController.js
│   ├── routes/          # Definición de rutas
│   │   ├── auth.js
│   │   ├── actividades.js
│   │   ├── usuarios.js
│   │   ├── certificados.js
│   │   ├── notificaciones.js
│   │   └── reportes.js
│   ├── utils/           # Utilidades y helpers
│   │   ├── validation.js
│   │   ├── geolocation.js
│   │   └── middleware.js
│   ├── config.js        # Configuración de Supabase
│   └── server.js        # Punto de entrada
├── supabase/           # Migraciones SQL
├── package.json
├── .env.example
└── README.md
```

## 🔐 Seguridad

### Autenticación
- JWT con tokens de acceso y refresh
- Autenticación en dos pasos (2FA) opcional
- Validación de roles y permisos

### Validaciones
- Validación de DPI guatemalteco
- Sanitización de inputs
- Validación de coordenadas geográficas
- Rate limiting por usuario

### Encriptación
- AES-256 para datos sensibles
- Hashing seguro de contraseñas con bcrypt
- Tokens seguros para operaciones críticas

### Row Level Security (RLS)
- Políticas granulares en Supabase
- Acceso controlado por roles
- Aislamiento de datos por usuario

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Actividades
- `GET /api/actividades` - Listar actividades
- `GET /api/actividades/:id` - Obtener actividad
- `POST /api/actividades` - Crear actividad
- `PUT /api/actividades/:id` - Actualizar actividad
- `DELETE /api/actividades/:id` - Eliminar actividad
- `POST /api/actividades/:id/inscribirse` - Inscribirse

### Usuarios
- `GET /api/usuarios/mis-inscripciones` - Mis inscripciones
- `PUT /api/usuarios/inscripciones/:id/cancelar` - Cancelar inscripción
- `PUT /api/usuarios/inscripciones/:id/evidencia` - Subir evidencia
- `GET /api/usuarios/mis-certificados` - Mis certificados
- `POST /api/usuarios/entidad` - Crear/actualizar entidad
- `PUT /api/usuarios/dpi` - Actualizar DPI

### Certificados
- `GET /api/certificados/:id/pdf` - Descargar certificado PDF
- `GET /api/certificados/validar/:numero` - Validar certificado
- `GET /api/certificados/estadisticas` - Estadísticas personales

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones
- `PUT /api/notificaciones/:id/leida` - Marcar como leída
- `PUT /api/notificaciones/marcar-todas-leidas` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar notificación

### Reportes (Solo Admins)
- `GET /api/reportes/estadisticas-generales` - Estadísticas del sistema
- `GET /api/reportes/actividades` - Reporte de actividades
- `GET /api/reportes/voluntarios` - Voluntarios más activos
- `GET /api/reportes/mapa-calor` - Datos para mapa de calor
- `GET /api/reportes/exportar-csv` - Exportar reportes en CSV

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas de seguridad
npm run test:security

# Pruebas de geolocalización
npm run test:geolocation
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=tu_url_de_produccion
SUPABASE_ANON_KEY=tu_key_de_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_service_key_de_produccion
JWT_SECRET=jwt_secret_super_seguro_de_produccion
ENCRYPTION_KEY=clave_encriptacion_produccion_32_chars
```

### Usando PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start src/server.js --name "voluntarios-backend"

# Ver logs
pm2 logs voluntarios-backend

# Reiniciar
pm2 restart voluntarios-backend
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoreo

### Logs
- Logs estructurados con timestamps
- Logging de errores y actividades críticas
- Rotación automática de logs

### Métricas Recomendadas
- Tiempo de respuesta de endpoints
- Número de usuarios activos
- Errores por minuto
- Uso de memoria y CPU

### Herramientas Sugeridas
- **Sentry** para monitoreo de errores
- **Prometheus** para métricas
- **Grafana** para visualización
- **Upptime** para monitoreo de disponibilidad

## 🔧 Mantenimiento

### Tareas Regulares
- Backup de base de datos
- Rotación de logs
- Actualización de dependencias
- Revisión de métricas de seguridad

### Comandos Útiles
```bash
# Verificar estado del servidor
curl http://localhost:5000/health

# Auditoría de seguridad
npm audit

# Actualizar dependencias
npm update

# Limpiar cache
npm cache clean --force
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Elder Ramiro Ixcopal Arroyo**
- Proyecto de gestión de voluntarios para Guatemala
- Enfoque en impacto social y tecnología accesible

## 🆘 Soporte

Para soporte técnico o preguntas:
1. Revisar la documentación
2. Buscar en issues existentes
3. Crear nuevo issue con detalles del problema
4. Incluir logs y pasos para reproducir

---

**¡Gracias por contribuir al impacto social en Guatemala! 🇬🇹**

