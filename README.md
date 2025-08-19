# VoluntariosGT - Sistema de Gestión de Voluntarios y Beneficiarios

## 🇬🇹 Desarrollado para Guatemala

**VoluntariosGT** es una aplicación móvil completa que conecta beneficiarios (personas necesitadas) con voluntarios (dispuestos a ayudar) y optimiza asignaciones usando geolocalización y habilidades para generar impacto social medible en comunidades guatemaltecas.

**Presentado por:** Elder Ramiro Ixcopal Arroyo

---

## 📱 Características Principales

### ✅ **Funcionalidades Clave**

| Módulo | Acciones Esenciales |
|--------|-------------------|
| **Registro** | Validación de DPI (13 dígitos + foto), Roles: Beneficiario/Voluntario/Entidad |
| **Actividades** | Publicación por entidades (escuelas/iglesias), Inscripción en tiempo real |
| **Geolocalización** | Mapas interactivos (OpenStreetMap), Asignación por proximidad (radio 5 km) |
| **Certificados** | Generación automática de PDFs, Historial verificable |
| **Notificaciones** | Alertas de nuevas actividades, Recordatorios automáticos |
| **Dashboard** | Reportes de impacto (beneficiarios/horas), Mapa de calor de zonas atendidas |

### 🔐 **Seguridad Esencial**

- **Encriptación:** AES-256 para fotos de DPI
- **Row Level Security (RLS)** en Supabase
- **Verificación de entidades:** Documentos legales escaneados
- **Verificación de beneficiarios:** Foto de DPI + geolocalización + timestamp
- **Autenticación JWT** con refresh tokens
- **Validación de 2 pasos**

---

## 🛠️ Tecnologías Utilizadas (100% Gratuitas)

| Capa | Herramientas |
|------|-------------|
| **Frontend Móvil** | React Native (Expo) + NativeWind (Tailwind) + React Navigation |
| **Backend** | Node.js + Express.js + Supabase SDK + Jest (Testing) |
| **Base de Datos** | Supabase (PostgreSQL) con Row Level Security (RLS) |
| **Dashboard Web** | React + Vite + Tailwind CSS + shadcn/ui |
| **Mapas** | React Native Maps + OpenStreetMap |
| **Seguridad** | JWT + Refresh Tokens + Validación de 2 pasos |
| **DevOps** | GitHub Actions (CI/CD) + Vercel/Render (Hosting) |
| **Tema Visual** | **🎨 Color Turquesa (#1ABC9C)** como color principal |

---

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm
- Expo CLI
- Cuenta de Supabase (gratuita)

### Pasos Mínimos

1. **Clonar repositorio:**
```bash
git clone https://github.com/tu-usuario/voluntarios-app
cd voluntarios-app
```

2. **Configurar variables de entorno:**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de Supabase

# Frontend Móvil
cp frontend/.env.example frontend/.env
# Editar frontend/.env con tus credenciales

# Dashboard Web
cp dashboard-web/.env.example dashboard-web/.env
# Editar dashboard-web/.env con la URL de tu API
```

3. **Instalar dependencias y ejecutar:**
```bash
# Instalar todas las dependencias (desde la raíz)
npm run install:all

# Opción 1: Ejecutar todo a la vez
npm run start

# Opción 2: Ejecutar individualmente
# Backend (en terminal 1)
cd backend && npm run dev

# Dashboard Web (en terminal 2)
cd dashboard-web && npm run dev

# Frontend Móvil (en terminal 3)
cd frontend && npm start
```

4. **Probar con Expo Go:**
   - Escanear QR en dispositivo físico
   - O usar simulador iOS/Android

---

## 📁 Estructura del Proyecto

```
voluntarios-app/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Controladores de la API
│   │   ├── routes/           # Rutas de la API
│   │   ├── utils/            # Utilidades y middleware
│   │   ├── config.js         # Configuración de Supabase
│   │   └── server.js         # Servidor principal
│   ├── __tests__/            # Tests con Jest
│   ├── jest.config.js        # Configuración de testing
│   ├── .env.example          # Ejemplo de variables de entorno
│   ├── package.json
│   └── README.md
├── frontend/                   # App móvil React Native
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── screens/          # Pantallas de la app
│   │   ├── services/         # Servicios (API, auth, etc.)
│   │   ├── context/          # Contextos de React
│   │   ├── constants/        # Configuración y colores
│   │   └── navigation/       # Configuración de navegación
│   ├── .env.example          # Ejemplo de variables de entorno
│   ├── App.js
│   └── package.json
├── dashboard-web/              # Dashboard administrativo React
│   ├── src/
│   │   ├── components/       # Componentes del dashboard
│   │   ├── hooks/            # Hooks personalizados
│   │   └── lib/              # Utilidades y servicios
│   ├── package.json
│   └── README.md
├── supabase/                   # Configuración de base de datos
│   └── migrations/           # Migraciones SQL
├── docs/                       # Documentación completa
└── README.md                   # Este archivo
```

---

## 🎯 Entregables Clave

| Componente | Descripción |
|------------|-------------|
| **App Móvil** | APK para Android 10+ (compatible con dispositivos básicos) |
| **Dashboard Web** | Panel de administración para entidades (reportes/gestión) |
| **Documentación** | Manual de usuario + Políticas de seguridad + Diagramas de flujo |
| **Certificados PDF** | Plantillas automatizadas con QR de validación |
| **Código Fuente** | Repositorio completo con todas las dependencias |

---

## 👥 Roles de Usuario

### 🤲 **Beneficiarios**
- Personas que necesitan ayuda
- Pueden solicitar asistencia en actividades
- Reciben notificaciones de actividades cercanas
- Verificación con DPI guatemalteco

### 🙋‍♂️ **Voluntarios**
- Personas dispuestas a ayudar
- Se inscriben en actividades de voluntariado
- Ganan puntos de reputación
- Obtienen certificados de participación

### 🏢 **Entidades**
- Organizaciones (escuelas, iglesias, ONGs)
- Publican actividades de voluntariado
- Gestionan inscripciones y participantes
- Generan reportes de impacto

### 👨‍💼 **Administradores**
- Gestión completa del sistema
- Verificación de entidades
- Reportes globales de impacto
- Configuración del sistema

---

## 🔧 Configuración Detallada

### Backend (Node.js + Express)

1. **Configurar Supabase:**
   - Crear proyecto en [supabase.com](https://supabase.com)
   - Obtener URL y claves del proyecto
   - Ejecutar migraciones SQL desde `supabase/migrations/`

2. **Variables de entorno (`backend/.env`):**
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=5000
NODE_ENV=development
```

3. **Ejecutar backend:**
```bash
cd backend
npm install
npm run dev  # Desarrollo con nodemon
# npm start   # Producción
```

4. **Ejecutar tests:**
```bash
npm test              # Todos los tests
npm run test:geolocation  # Tests de geolocalización
npm run test:security     # Auditoría de seguridad + tests
```

### Frontend Móvil (React Native + Expo)

1. **Variables de entorno (`frontend/.env`):**
```env
# URLs del Backend
EXPO_PUBLIC_API_BASE_URL_DEV=http://localhost:5000/api
EXPO_PUBLIC_API_BASE_URL_PROD=https://voluntariosgt-sistema-de-gesti-n-de.onrender.com/api

# Configuración de Supabase
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Configuración de Mapas (Guatemala)
EXPO_PUBLIC_DEFAULT_LATITUDE=14.6349
EXPO_PUBLIC_DEFAULT_LONGITUDE=-90.5069
EXPO_PUBLIC_DEFAULT_SEARCH_RADIUS=5

# Features habilitadas
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true
EXPO_PUBLIC_ENABLE_CAMERA=true
```

2. **Ejecutar app móvil:**
```bash
cd frontend
npm install
npx expo start
```

### Dashboard Web (React + Vite)

1. **Variables de entorno (`dashboard-web/.env`):**
```env
# Para desarrollo
VITE_API_BASE_URL=http://localhost:5000/api

# Para producción
VITE_API_BASE_URL=https://voluntariosgt-sistema-de-gesti-n-de.onrender.com/api
```

2. **Ejecutar dashboard:**
```bash
cd dashboard-web
npm install
npm run dev
```

---

## 📊 Base de Datos (Supabase)

### Tablas Principales

- **perfiles** - Información base de todos los usuarios
- **entidades** - Organizaciones que publican actividades
- **actividades** - Actividades de voluntariado con geolocalización PostGIS
- **inscripciones** - Relación usuarios-actividades
- **certificados** - Certificados generados automáticamente
- **notificaciones** - Sistema de notificaciones push

### Políticas de Seguridad (RLS)

```sql
-- Ejemplo: Beneficiarios solo ven sus datos
CREATE POLICY "Beneficiarios solo ven sus datos" 
ON beneficiarios FOR SELECT USING (auth.uid() = id);
```

---

## 🧪 Credenciales de Prueba

### Dashboard Administrativo
- **Admin:** admin@voluntariosgt.org / admin123
- **Entidad:** entidad@ejemplo.org / entidad123

### App Móvil
- **Voluntario:** voluntario@test.com / test123
- **Beneficiario:** beneficiario@test.com / test123

---

## 📱 Funcionalidades por Pantalla

### App Móvil

#### 🏠 **Pantalla de Inicio**
- Dashboard personalizado por rol
- Estadísticas del usuario
- Actividades recientes
- Acciones rápidas

#### 📋 **Actividades**
- Lista de actividades disponibles
- Filtros por categoría, ubicación, fecha
- Búsqueda en tiempo real
- Inscripción con un toque

#### 🗺️ **Mapa**
- Visualización de actividades cercanas
- Geolocalización automática
- Filtro por radio de distancia
- Navegación a ubicaciones

#### 👤 **Perfil**
- Información personal
- Historial de actividades
- Certificados obtenidos
- Configuración de cuenta

### Dashboard Web

#### 📊 **Dashboard Principal**
- Métricas en tiempo real
- Gráficos de impacto
- Actividades recientes
- Acciones rápidas

#### 👥 **Gestión de Usuarios** (Solo Admin)
- Lista de todos los usuarios
- Verificación de cuentas
- Estadísticas por rol
- Gestión de permisos

#### 📅 **Gestión de Actividades**
- Crear/editar actividades
- Gestionar inscripciones
- Reportes de participación
- Certificados automáticos

---

## 🔒 Seguridad y Privacidad

### Medidas Implementadas

1. **Autenticación Robusta**
   - JWT con refresh tokens
   - Validación de 2 pasos opcional
   - Sesiones seguras

2. **Protección de Datos**
   - Encriptación AES-256 para datos sensibles
   - Row Level Security en base de datos
   - Validación de entrada en todos los endpoints

3. **Verificación de Identidad**
   - DPI guatemalteco obligatorio
   - Verificación fotográfica
   - Geolocalización para validación

4. **Privacidad**
   - Datos mínimos necesarios
   - Consentimiento explícito
   - Derecho al olvido implementado

---

## 🚀 Despliegue en Producción

### Backend
```bash
# Desplegado en Render
# URL: https://voluntariosgt-sistema-de-gesti-n-de.onrender.com

# Para redesplegar:
git push origin main
# El servicio se despliega automáticamente

# Health check disponible en:
# https://voluntariosgt-sistema-de-gesti-n-de.onrender.com/health
```

### Dashboard Web
```bash
# Usando Vercel
npm run build
vercel --prod
```

### App Móvil
```bash
# Generar APK con EAS Build (recomendado)
npm run build:frontend

# O usar expo build (legacy)
expo build:android
```

---

## 🎨 Tema Visual Turquesa

### Paleta de Colores Principal
- **Color Primario:** `#1ABC9C` (Turquesa brillante)
- **Color Primario Claro:** `#48C9B0` 
- **Color Primario Oscuro:** `#16A085`
- **Gradiente:** `['#1ABC9C', '#16A085']`

### Colores por Rol de Usuario
- **Voluntarios:** `#3498DB` (Azul)
- **Beneficiarios:** `#9B59B6` (Púrpura)
- **Entidades:** `#E67E22` (Naranja)
- **Administradores:** `#2C3E50` (Gris oscuro)

### Estados de Actividad
- **Abierta:** `#27AE60` (Verde)
- **Cerrada:** `#E74C3C` (Rojo)
- **Completada:** `#8E44AD` (Púrpura)
- **Cancelada:** `#95A5A6` (Gris)

### Configuración de Colores
```javascript
// frontend/src/constants/colors.js
export const COLORS = {
  primary: '#1ABC9C',      // Turquesa principal
  primaryLight: '#48C9B0',
  primaryDark: '#16A085',
  // ... más colores
};
```

---

## ✅ Funcionalidades Implementadas

### Backend Completo
- ✅ **API REST** con Node.js + Express
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Tests con Jest** (24 tests pasando)
- ✅ **Geolocalización** con funciones de proximidad
- ✅ **Validación DPI** guatemalteco
- ✅ **Row Level Security** en Supabase
- ✅ **Variables de entorno** configuradas
- ✅ **PM2** para gestión de procesos

### Frontend Móvil
- ✅ **React Native + Expo** funcionando
- ✅ **Navegación completa** con tabs y stack
- ✅ **Contexto de autenticación** implementado
- ✅ **API Client** robusto con manejo de errores
- ✅ **Variables de entorno** con `EXPO_PUBLIC_*`
- ✅ **Servicios** de auth, actividades, ubicación
- ✅ **Tema turquesa** aplicado consistentemente

### Dashboard Web
- ✅ **React + Vite** con Tailwind CSS
- ✅ **shadcn/ui** components implementados
- ✅ **Autenticación** y protección de rutas
- ✅ **Formularios** con React Hook Form + Zod
- ✅ **Variables de entorno** configuradas

### Base de Datos
- ✅ **Supabase PostgreSQL** con PostGIS
- ✅ **Migraciones SQL** estructuradas
- ✅ **RLS Policies** implementadas
- ✅ **Tipos de datos** optimizados para Guatemala

### DevOps y Configuración
- ✅ **Workspace npm** con scripts consolidados
- ✅ **Variables de entorno** en todos los proyectos
- ✅ **Testing suite** configurada
- ✅ **Dependencias** actualizadas y sin vulnerabilidades
- ✅ **Documentación** completa y actualizada

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 📞 Soporte

- **Desarrollador:** Elder Ramiro Ixcopal Arroyo
- **Email:** elder@voluntariosgt.org
- **Documentación:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/voluntarios-app/issues)

---

## 🙏 Agradecimientos

- Comunidad de desarrolladores de Guatemala
- Organizaciones de voluntariado participantes
- Contribuidores del proyecto open source

---

**¡Gracias por usar VoluntariosGT! Juntos construimos un Guatemala mejor. 🇬🇹**

