# Documentación Técnica - VoluntariosGT

## Arquitectura del Sistema y Guía de Desarrollo

**Versión:** 1.0.0  
**Fecha:** Agosto 2025  
**Autor:** Elder Ramiro Ixcopal Arroyo  

---

## Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Base de Datos](#base-de-datos)
4. [API Backend](#api-backend)
5. [Frontend Móvil](#frontend-móvil)
6. [Dashboard Web](#dashboard-web)
7. [Seguridad](#seguridad)
8. [Despliegue](#despliegue)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Guía de Contribución](#guía-de-contribución)

---

## Arquitectura del Sistema

### Visión General

VoluntariosGT implementa una arquitectura moderna de tres capas con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend Móvil          │         Dashboard Web            │
│  (React Native + Expo)   │         (React + Vite)          │
│                          │                                  │
│  • Pantallas de usuario  │  • Panel administrativo         │
│  • Navegación            │  • Reportes y análisis          │
│  • Componentes UI        │  • Gestión de entidades         │
│  • Geolocalización       │  • Configuración sistema        │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE LÓGICA                         │
├─────────────────────────────────────────────────────────────┤
│                Backend API (Node.js + Express)              │
│                                                             │
│  • Controladores de negocio    • Middleware de seguridad   │
│  • Validación de datos         • Autenticación JWT         │
│  • Lógica de geolocalización   • Generación de certificados│
│  • Gestión de notificaciones   • Integración con Supabase  │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL/PostgreSQL
                                    │ Supabase SDK
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS                          │
├─────────────────────────────────────────────────────────────┤
│                  Supabase (PostgreSQL)                     │
│                                                             │
│  • Base de datos relacional     • Row Level Security (RLS) │
│  • Autenticación integrada      • Triggers y funciones     │
│  • Almacenamiento de archivos   • Backups automáticos      │
│  • APIs en tiempo real          • Escalabilidad automática │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

#### 1. **Separation of Concerns (Separación de Responsabilidades)**
- **Frontend:** Manejo de UI/UX, navegación, y experiencia del usuario
- **Backend:** Lógica de negocio, validaciones, y orquestación de servicios
- **Base de Datos:** Persistencia, integridad de datos, y consultas optimizadas

#### 2. **Microservicios Modulares**
Aunque implementado como monolito, el backend está estructurado en módulos independientes:
- **Módulo de Autenticación:** Gestión de usuarios y sesiones
- **Módulo de Actividades:** CRUD y lógica de actividades
- **Módulo de Geolocalización:** Cálculos de distancia y mapas
- **Módulo de Certificados:** Generación y validación de PDFs
- **Módulo de Notificaciones:** Envío y gestión de alertas

#### 3. **API-First Design**
- Todas las funcionalidades expuestas como APIs REST
- Documentación automática con OpenAPI/Swagger
- Versionado de APIs para compatibilidad
- Respuestas consistentes y estandarizadas

#### 4. **Security by Design**
- Autenticación JWT con refresh tokens
- Row Level Security en base de datos
- Validación exhaustiva de entrada
- Encriptación de datos sensibles
- Auditoría completa de acciones

---

## Stack Tecnológico

### Frontend Móvil

#### React Native + Expo
```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.5",
  "react": "18.2.0"
}
```

**Ventajas de Expo:**
- Desarrollo rápido sin configuración nativa
- Hot reloading para desarrollo eficiente
- Acceso a APIs nativas (cámara, GPS, notificaciones)
- Distribución fácil con Expo Go
- Build automático para tiendas de aplicaciones

#### Librerías Principales
```json
{
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/stack": "^6.3.17",
  "@react-navigation/bottom-tabs": "^6.5.8",
  "react-native-maps": "1.14.0",
  "expo-location": "~17.0.1",
  "expo-camera": "~15.0.14",
  "@supabase/supabase-js": "^2.38.0",
  "nativewind": "^2.0.11",
  "@react-native-async-storage/async-storage": "1.23.1"
}
```

### Backend API

#### Node.js + Express
```json
{
  "node": ">=18.0.0",
  "express": "^4.18.2",
  "@supabase/supabase-js": "^2.38.0"
}
```

#### Librerías de Seguridad
```json
{
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "helmet": "^7.0.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^6.10.0",
  "express-validator": "^7.0.1"
}
```

#### Utilidades
```json
{
  "jspdf": "^2.5.1",
  "qrcode": "^1.5.3",
  "nodemailer": "^6.9.4",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.32.5"
}
```

### Dashboard Web

#### React + Vite
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^5.0.0"
}
```

#### UI Framework
```json
{
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "^1.0.0",
  "lucide-react": "^0.263.1",
  "recharts": "^2.8.0"
}
```

### Base de Datos

#### Supabase (PostgreSQL 15)
- **Hosting:** Supabase Cloud
- **Versión:** PostgreSQL 15.1
- **Extensiones:** PostGIS para geolocalización
- **Backup:** Automático diario
- **Escalabilidad:** Automática según demanda

---

## Base de Datos

### Esquema de Datos

#### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    dpi VARCHAR(13) UNIQUE NOT NULL,
    foto_dpi_url TEXT,
    rol usuario_rol NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    reputacion INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_dpi ON usuarios(dpi);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
```

#### Tabla: `actividades`
```sql
CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria actividad_categoria NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    ubicacion GEOGRAPHY(POINT, 4326) NOT NULL,
    direccion_completa TEXT NOT NULL,
    cupos_totales INTEGER NOT NULL CHECK (cupos_totales > 0),
    cupos_ocupados INTEGER DEFAULT 0 CHECK (cupos_ocupados >= 0),
    estado actividad_estado DEFAULT 'abierta',
    habilidades_requeridas TEXT[],
    materiales_necesarios TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_cupos CHECK (cupos_ocupados <= cupos_totales),
    CONSTRAINT check_fechas CHECK (fecha_fin > fecha_inicio)
);

-- Índices geoespaciales
CREATE INDEX idx_actividades_ubicacion ON actividades USING GIST(ubicacion);
CREATE INDEX idx_actividades_fecha_inicio ON actividades(fecha_inicio);
CREATE INDEX idx_actividades_categoria ON actividades(categoria);
CREATE INDEX idx_actividades_estado ON actividades(estado);
```

#### Tabla: `inscripciones`
```sql
CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    estado inscripcion_estado DEFAULT 'inscrito',
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    evidencia_url TEXT,
    evaluacion INTEGER CHECK (evaluacion >= 1 AND evaluacion <= 5),
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(actividad_id, usuario_id)
);

CREATE INDEX idx_inscripciones_actividad ON inscripciones(actividad_id);
CREATE INDEX idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
```

### Tipos Enumerados

```sql
-- Roles de usuario
CREATE TYPE usuario_rol AS ENUM (
    'beneficiario',
    'voluntario', 
    'entidad',
    'admin'
);

-- Estados de actividad
CREATE TYPE actividad_estado AS ENUM (
    'abierta',
    'cerrada',
    'completada',
    'cancelada'
);

-- Categorías de actividad
CREATE TYPE actividad_categoria AS ENUM (
    'Educación',
    'Salud',
    'Medio Ambiente',
    'Asistencia Social',
    'Deportes y Recreación',
    'Arte y Cultura',
    'Tecnología',
    'Construcción',
    'Alimentación',
    'Emergencias',
    'Otro'
);

-- Estados de inscripción
CREATE TYPE inscripcion_estado AS ENUM (
    'inscrito',
    'confirmado',
    'completado',
    'cancelado'
);
```

### Row Level Security (RLS)

#### Políticas de Seguridad

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y editar sus propios datos
CREATE POLICY "usuarios_propios_datos" ON usuarios
    FOR ALL USING (auth.uid() = id);

-- Política: Las actividades son visibles para todos los usuarios autenticados
CREATE POLICY "actividades_lectura_publica" ON actividades
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política: Solo las entidades pueden crear/editar sus actividades
CREATE POLICY "actividades_gestion_entidades" ON actividades
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM usuarios 
            WHERE rol = 'entidad' AND verificado = true
        )
    );

-- Política: Los usuarios pueden ver sus propias inscripciones
CREATE POLICY "inscripciones_usuario" ON inscripciones
    FOR ALL USING (auth.uid() = usuario_id);

-- Política: Las entidades pueden ver inscripciones a sus actividades
CREATE POLICY "inscripciones_entidad" ON inscripciones
    FOR SELECT USING (
        auth.uid() IN (
            SELECT entidad_id FROM actividades 
            WHERE id = inscripciones.actividad_id
        )
    );
```

### Funciones y Triggers

#### Función: Actualizar cupos automáticamente
```sql
CREATE OR REPLACE FUNCTION actualizar_cupos_actividad()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.estado = 'confirmado' THEN
        UPDATE actividades 
        SET cupos_ocupados = cupos_ocupados + 1
        WHERE id = NEW.actividad_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado != 'confirmado' AND NEW.estado = 'confirmado' THEN
            UPDATE actividades 
            SET cupos_ocupados = cupos_ocupados + 1
            WHERE id = NEW.actividad_id;
        ELSIF OLD.estado = 'confirmado' AND NEW.estado != 'confirmado' THEN
            UPDATE actividades 
            SET cupos_ocupados = cupos_ocupados - 1
            WHERE id = NEW.actividad_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.estado = 'confirmado' THEN
        UPDATE actividades 
        SET cupos_ocupados = cupos_ocupados - 1
        WHERE id = OLD.actividad_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar cupos
CREATE TRIGGER trigger_actualizar_cupos
    AFTER INSERT OR UPDATE OR DELETE ON inscripciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_cupos_actividad();
```

#### Función: Generar certificados automáticamente
```sql
CREATE OR REPLACE FUNCTION generar_certificado_automatico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        INSERT INTO certificados (
            usuario_id,
            actividad_id,
            codigo_verificacion,
            fecha_emision
        ) VALUES (
            NEW.usuario_id,
            NEW.actividad_id,
            gen_random_uuid()::text,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar certificados
CREATE TRIGGER trigger_generar_certificado
    AFTER UPDATE ON inscripciones
    FOR EACH ROW EXECUTE FUNCTION generar_certificado_automatico();
```

### Consultas Geoespaciales

#### Buscar actividades por proximidad
```sql
-- Función para buscar actividades cercanas
CREATE OR REPLACE FUNCTION buscar_actividades_cercanas(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radio_km INTEGER DEFAULT 5,
    limite INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    titulo VARCHAR,
    descripcion TEXT,
    categoria actividad_categoria,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    direccion_completa TEXT,
    distancia_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.titulo,
        a.descripcion,
        a.categoria,
        a.fecha_inicio,
        a.direccion_completa,
        ST_Distance(
            a.ubicacion::geometry,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        ) / 1000.0 AS distancia_km
    FROM actividades a
    WHERE 
        a.estado = 'abierta'
        AND ST_DWithin(
            a.ubicacion::geometry,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326),
            radio_km * 1000
        )
    ORDER BY distancia_km ASC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;
```

---

## API Backend

### Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/          # Controladores de rutas
│   │   ├── authController.js
│   │   ├── actividadesController.js
│   │   ├── usuariosController.js
│   │   ├── certificadosController.js
│   │   ├── notificacionesController.js
│   │   └── reportesController.js
│   ├── routes/              # Definición de rutas
│   │   ├── auth.js
│   │   ├── actividades.js
│   │   ├── usuarios.js
│   │   ├── certificados.js
│   │   ├── notificaciones.js
│   │   └── reportes.js
│   ├── utils/               # Utilidades y middleware
│   │   ├── middleware.js
│   │   ├── validation.js
│   │   ├── geolocation.js
│   │   └── pdfGenerator.js
│   ├── config.js           # Configuración de Supabase
│   └── server.js           # Servidor principal
├── package.json
└── README.md
```

### Configuración del Servidor

#### server.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas peticiones, intenta más tarde'
});
app.use('/api/', limiter);

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/certificados', require('./routes/certificados'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/reportes', require('./routes/reportes'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

### Controladores

#### authController.js
```javascript
const { supabaseAdmin, supabase } = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class AuthController {
    // Registro de usuario
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Datos de entrada inválidos',
                    details: errors.array()
                });
            }

            const { email, password, nombre_completo, telefono, dpi, rol } = req.body;

            // Verificar que el DPI sea guatemalteco (13 dígitos)
            if (!/^\d{13}$/.test(dpi)) {
                return res.status(400).json({
                    error: 'DPI debe tener exactamente 13 dígitos'
                });
            }

            // Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });

            if (authError) {
                return res.status(400).json({
                    error: 'Error al crear usuario',
                    message: authError.message
                });
            }

            // Crear perfil de usuario
            const { data: userData, error: userError } = await supabaseAdmin
                .from('usuarios')
                .insert({
                    id: authData.user.id,
                    email,
                    nombre_completo,
                    telefono,
                    dpi,
                    rol,
                    verificado: false
                })
                .select()
                .single();

            if (userError) {
                // Revertir creación de usuario en Auth si falla
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
                return res.status(400).json({
                    error: 'Error al crear perfil de usuario',
                    message: userError.message
                });
            }

            // Generar tokens JWT
            const accessToken = jwt.sign(
                { userId: userData.id, email: userData.email, rol: userData.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { userId: userData.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: userData.id,
                    email: userData.email,
                    nombre_completo: userData.nombre_completo,
                    rol: userData.rol,
                    verificado: userData.verificado
                },
                session: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: 3600
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Inicio de sesión
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Datos de entrada inválidos',
                    details: errors.array()
                });
            }

            const { email, password } = req.body;

            // Autenticar con Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: authError.message
                });
            }

            // Obtener datos del usuario
            const { data: userData, error: userError } = await supabaseAdmin
                .from('usuarios')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError || !userData) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            // Generar tokens JWT personalizados
            const accessToken = jwt.sign(
                { 
                    userId: userData.id, 
                    email: userData.email, 
                    rol: userData.rol,
                    verificado: userData.verificado
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { userId: userData.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: userData.id,
                    email: userData.email,
                    nombre_completo: userData.nombre_completo,
                    rol: userData.rol,
                    verificado: userData.verificado,
                    reputacion: userData.reputacion
                },
                session: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: 3600
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Refrescar token
    async refreshToken(req, res) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({
                    error: 'Refresh token requerido'
                });
            }

            // Verificar refresh token
            const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

            // Obtener datos actuales del usuario
            const { data: userData, error: userError } = await supabaseAdmin
                .from('usuarios')
                .select('*')
                .eq('id', decoded.userId)
                .single();

            if (userError || !userData) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            // Generar nuevo access token
            const accessToken = jwt.sign(
                { 
                    userId: userData.id, 
                    email: userData.email, 
                    rol: userData.rol,
                    verificado: userData.verificado
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                session: {
                    access_token: accessToken,
                    refresh_token: refresh_token, // Mantener el mismo refresh token
                    expires_in: 3600
                }
            });

        } catch (error) {
            console.error('Error al refrescar token:', error);
            res.status(401).json({
                error: 'Refresh token inválido'
            });
        }
    }
}

module.exports = new AuthController();
```

### Middleware de Autenticación

#### middleware.js
```javascript
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config');

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token de acceso requerido'
            });
        }

        // Verificar token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtener datos actuales del usuario
        const { data: userData, error } = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !userData) {
            return res.status(401).json({
                error: 'Usuario no encontrado'
            });
        }

        // Agregar datos del usuario a la request
        req.user = userData;
        next();

    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({
            error: 'Token inválido'
        });
    }
};

// Middleware de autorización por rol
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'Permisos insuficientes'
            });
        }

        next();
    };
};

// Middleware de verificación de cuenta
const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Usuario no autenticado'
        });
    }

    if (!req.user.verificado) {
        return res.status(403).json({
            error: 'Cuenta no verificada'
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requireVerified
};
```

### Validaciones

#### validation.js
```javascript
const { body, param, query } = require('express-validator');

// Validaciones para autenticación
const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email debe ser válido'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    body('nombre_completo')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nombre completo debe tener entre 2 y 255 caracteres'),
    body('telefono')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Teléfono debe contener solo números y caracteres válidos'),
    body('dpi')
        .matches(/^\d{13}$/)
        .withMessage('DPI debe tener exactamente 13 dígitos'),
    body('rol')
        .isIn(['beneficiario', 'voluntario', 'entidad'])
        .withMessage('Rol debe ser beneficiario, voluntario o entidad')
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email debe ser válido'),
    body('password')
        .notEmpty()
        .withMessage('Contraseña es requerida')
];

// Validaciones para actividades
const validateCreateActivity = [
    body('titulo')
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Título debe tener entre 5 y 255 caracteres'),
    body('descripcion')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Descripción debe tener entre 20 y 2000 caracteres'),
    body('categoria')
        .isIn([
            'Educación', 'Salud', 'Medio Ambiente', 'Asistencia Social',
            'Deportes y Recreación', 'Arte y Cultura', 'Tecnología',
            'Construcción', 'Alimentación', 'Emergencias', 'Otro'
        ])
        .withMessage('Categoría no válida'),
    body('fecha_inicio')
        .isISO8601()
        .toDate()
        .custom((value) => {
            if (value <= new Date()) {
                throw new Error('Fecha de inicio debe ser futura');
            }
            return true;
        }),
    body('fecha_fin')
        .isISO8601()
        .toDate()
        .custom((value, { req }) => {
            if (value <= new Date(req.body.fecha_inicio)) {
                throw new Error('Fecha de fin debe ser posterior a fecha de inicio');
            }
            return true;
        }),
    body('latitud')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitud debe estar entre -90 y 90'),
    body('longitud')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitud debe estar entre -180 y 180'),
    body('direccion_completa')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Dirección debe tener entre 10 y 500 caracteres'),
    body('cupos_totales')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Cupos totales debe ser entre 1 y 1000')
];

// Validación de DPI guatemalteco
const validateDPI = (dpi) => {
    if (!/^\d{13}$/.test(dpi)) {
        return false;
    }

    // Algoritmo de validación de DPI guatemalteco
    const digits = dpi.split('').map(Number);
    const departamento = parseInt(dpi.substring(9, 11));
    const municipio = parseInt(dpi.substring(11, 13));

    // Verificar departamento válido (01-22)
    if (departamento < 1 || departamento > 22) {
        return false;
    }

    // Verificar municipio válido (01-99)
    if (municipio < 1 || municipio > 99) {
        return false;
    }

    // Cálculo del dígito verificador
    let suma = 0;
    for (let i = 0; i < 12; i++) {
        suma += digits[i] * (i + 2);
    }

    const modulo = suma % 11;
    const digitoVerificador = modulo < 2 ? modulo : 11 - modulo;

    return digitoVerificador === digits[12];
};

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateActivity,
    validateDPI
};
```

---

## Frontend Móvil

### Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── LoadingSpinner.js
│   │   └── ActivityCard.js
│   ├── screens/            # Pantallas de la aplicación
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ActivitiesScreen.js
│   │   ├── MapScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/         # Configuración de navegación
│   │   └── AppNavigator.js
│   ├── context/           # Contextos de React
│   │   └── AuthContext.js
│   ├── services/          # Servicios y APIs
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── activities.js
│   │   └── location.js
│   └── constants/         # Constantes y configuración
│       ├── colors.js
│       └── config.js
├── App.js
└── package.json
```

### Configuración Principal

#### App.js
```javascript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      <AppNavigator />
    </AuthProvider>
  );
}
```

### Contexto de Autenticación

#### AuthContext.js
```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verificar que el token sea válido
        try {
          const profile = await authService.getProfile();
          dispatch({ type: 'SET_USER', payload: profile });
        } catch (error) {
          // Token inválido, limpiar datos
          await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.login(email, password);
      
      // Guardar tokens y datos del usuario
      await AsyncStorage.multiSet([
        ['auth_token', response.session.access_token],
        ['refresh_token', response.session.refresh_token],
        ['user_data', JSON.stringify(response.user)]
      ]);

      dispatch({ type: 'SET_USER', payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      
      // Guardar tokens y datos del usuario
      await AsyncStorage.multiSet([
        ['auth_token', response.session.access_token],
        ['refresh_token', response.session.refresh_token],
        ['user_data', JSON.stringify(response.user)]
      ]);

      dispatch({ type: 'SET_USER', payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Intentar cerrar sesión en el servidor
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Error al cerrar sesión en servidor:', error);
      }

      // Limpiar datos locales
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error en logout:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### Servicio de API

#### api.js
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

class ApiClient {
  constructor() {
    this.baseURL = APP_CONFIG.API_BASE_URL;
    this.timeout = 30000;
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('auth_token');
  }

  async getRefreshToken() {
    return await AsyncStorage.getItem('refresh_token');
  }

  async saveTokens(accessToken, refreshToken) {
    await AsyncStorage.multiSet([
      ['auth_token', accessToken],
      ['refresh_token', refreshToken]
    ]);
  }

  async clearTokens() {
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
  }

  async createHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.error || 'Error en la petición', response.status, data);
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new ApiError('Error en la petición', response.status);
      }
      return response;
    }
  }

  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await this.handleResponse(response);
      
      await this.saveTokens(
        data.session.access_token,
        data.session.refresh_token
      );

      return data.session.access_token;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await this.clearTokens();
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      includeAuth = true,
      isRetry = false,
      ...otherOptions
    } = options;

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.createHeaders(includeAuth);

      const config = {
        method,
        headers,
        ...otherOptions,
      };

      if (body) {
        if (body instanceof FormData) {
          delete config.headers['Content-Type'];
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      return await this.handleResponse(response);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Tiempo de espera agotado', 408);
      }

      // Si es error 401 y no es un retry, intentar refrescar token
      if (error.status === 401 && includeAuth && !isRetry) {
        try {
          await this.refreshAccessToken();
          return await this.request(endpoint, { ...options, isRetry: true });
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          throw error;
        }
      }

      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

---

## Dashboard Web

### Estructura del Proyecto

```
dashboard-web/
├── src/
│   ├── components/         # Componentes React
│   │   ├── LoginForm.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── DashboardHome.jsx
│   ├── hooks/             # Hooks personalizados
│   │   └── useAuth.js
│   ├── lib/               # Utilidades y servicios
│   │   ├── api.js
│   │   └── auth.js
│   └── assets/            # Recursos estáticos
├── public/
├── index.html
├── package.json
└── vite.config.js
```

### Configuración de Vite

#### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Hook de Autenticación

#### useAuth.js
```javascript
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../lib/auth.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setError(error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
      setError(error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback((role) => {
    return authService.hasRole(role);
  }, [user]);

  const hasPermission = useCallback((permission) => {
    return authService.hasPermission(permission);
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus,
    hasRole,
    hasPermission,
    isAdmin: () => authService.isAdmin(),
    isEntity: () => authService.isEntity(),
    getRoleInfo: () => authService.getRoleInfo(),
    getUserDisplayInfo: () => authService.getUserDisplayInfo(),
  };
};
```

---

## Seguridad

### Autenticación y Autorización

#### JWT (JSON Web Tokens)
```javascript
// Estructura del token JWT
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "rol": "voluntario",
    "verificado": true,
    "iat": 1692123456,
    "exp": 1692127056
  },
  "signature": "hash-de-verificacion"
}
```

#### Refresh Token Strategy
```javascript
// Implementación de refresh token
const refreshTokens = new Map(); // En producción usar Redis

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      rol: user.rol,
      verificado: user.verificado
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Token corto para mayor seguridad
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Almacenar refresh token
  refreshTokens.set(user.id, refreshToken);

  return { accessToken, refreshToken };
};
```

### Validación de Entrada

#### Sanitización de Datos
```javascript
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/[<>]/g, '') // Remover caracteres HTML
    .substring(0, 1000); // Limitar longitud
};

const validateAndSanitize = (req, res, next) => {
  // Sanitizar todos los campos de texto
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  }
  
  next();
};
```

#### Validación de DPI Guatemalteco
```javascript
const validateGuatemalanDPI = (dpi) => {
  // Verificar formato básico
  if (!/^\d{13}$/.test(dpi)) {
    return { valid: false, error: 'DPI debe tener 13 dígitos' };
  }

  const digits = dpi.split('').map(Number);
  
  // Extraer departamento y municipio
  const departamento = parseInt(dpi.substring(9, 11));
  const municipio = parseInt(dpi.substring(11, 13));

  // Validar departamento (01-22)
  if (departamento < 1 || departamento > 22) {
    return { valid: false, error: 'Código de departamento inválido' };
  }

  // Validar municipio (01-99)
  if (municipio < 1 || municipio > 99) {
    return { valid: false, error: 'Código de municipio inválido' };
  }

  // Algoritmo de verificación del dígito verificador
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    suma += digits[i] * (i + 2);
  }

  const modulo = suma % 11;
  const digitoVerificador = modulo < 2 ? modulo : 11 - modulo;

  if (digitoVerificador !== digits[12]) {
    return { valid: false, error: 'Dígito verificador inválido' };
  }

  return { valid: true };
};
```

### Encriptación de Datos

#### Encriptación AES-256
```javascript
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY; // 32 bytes
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('VoluntariosGT', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedObj) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('VoluntariosGT', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Uso para encriptar datos sensibles como DPI
const encryptionService = new EncryptionService();

const encryptDPI = (dpi) => {
  return encryptionService.encrypt(dpi);
};
```

### Rate Limiting

#### Configuración de Rate Limits
```javascript
const rateLimit = require('express-rate-limit');

// Rate limit general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Demasiadas peticiones, intenta más tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para autenticación (más restrictivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de inicio de sesión, intenta más tarde',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true
});

// Rate limit para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    error: 'Demasiados registros desde esta IP, intenta más tarde',
    retryAfter: '1 hora'
  }
});

// Aplicar rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
```

### Auditoría y Logging

#### Sistema de Auditoría
```javascript
const auditLogger = require('./utils/auditLogger');

const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log de la acción
      auditLogger.log({
        userId: req.user?.id,
        action: action,
        resource: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        success: res.statusCode < 400,
        statusCode: res.statusCode
      });

      originalSend.call(this, data);
    };

    next();
  };
};

// Uso en rutas sensibles
app.post('/api/actividades', 
  authenticateToken,
  auditMiddleware('CREATE_ACTIVITY'),
  actividadesController.create
);
```

---

## Despliegue

### Configuración de Producción

#### Variables de Entorno
```bash
# Backend (.env.production)
NODE_ENV=production
PORT=5000

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_produccion
SUPABASE_ANON_KEY=tu_anon_key_produccion

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_para_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_diferente_y_seguro

# Encriptación
ENCRYPTION_KEY=tu_clave_de_encriptacion_de_32_bytes

# CORS
ALLOWED_ORIGINS=https://tu-dashboard.vercel.app,https://tu-dominio.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

#### Dockerfile para Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    env_file:
      - ./backend/.env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped
```

### Despliegue en Render

#### render.yaml
```yaml
services:
  - type: web
    name: voluntarios-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        fromDatabase:
          name: voluntarios-db
          property: connectionString
```

### Despliegue del Dashboard en Vercel

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://tu-backend.render.com/api"
  }
}
```

### Build de la App Móvil

#### Configuración EAS Build
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Comandos de Build
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android
eas build --platform android --profile production

# Build para iOS (requiere cuenta de desarrollador)
eas build --platform ios --profile production

# Submit a tiendas
eas submit --platform android
```

---

## Monitoreo y Logs

### Sistema de Logging

#### Winston Logger
```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'voluntarios-backend' },
  transports: [
    // Logs de error
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    // Logs combinados
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
  ],
});

// En desarrollo, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Métricas y Monitoreo

#### Health Check Endpoint
```javascript
const express = require('express');
const { supabaseAdmin } = require('../config');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {}
  };

  try {
    // Verificar conexión a base de datos
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('count')
      .limit(1);
    
    healthCheck.checks.database = error ? 'ERROR' : 'OK';
    
    // Verificar memoria
    const memUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    // Verificar espacio en disco
    const fs = require('fs');
    const stats = fs.statSync('.');
    healthCheck.checks.disk = 'OK';

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    healthCheck.message = 'ERROR';
    healthCheck.checks.database = 'ERROR';
    res.status(503).json(healthCheck);
  }
});

module.exports = router;
```

### Alertas y Notificaciones

#### Sistema de Alertas
```javascript
const nodemailer = require('nodemailer');
const logger = require('./logger');

class AlertService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendAlert(level, message, details = {}) {
    try {
      const alertData = {
        level,
        message,
        details,
        timestamp: new Date().toISOString(),
        service: 'voluntarios-backend'
      };

      // Log local
      logger.error('ALERT:', alertData);

      // Enviar email para alertas críticas
      if (level === 'critical') {
        await this.sendEmailAlert(alertData);
      }

      // Aquí se podría integrar con servicios como Slack, Discord, etc.
      
    } catch (error) {
      logger.error('Error sending alert:', error);
    }
  }

  async sendEmailAlert(alertData) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: `[ALERT] ${alertData.level.toUpperCase()} - VoluntariosGT`,
      html: `
        <h2>Alerta del Sistema</h2>
        <p><strong>Nivel:</strong> ${alertData.level}</p>
        <p><strong>Mensaje:</strong> ${alertData.message}</p>
        <p><strong>Timestamp:</strong> ${alertData.timestamp}</p>
        <p><strong>Detalles:</strong></p>
        <pre>${JSON.stringify(alertData.details, null, 2)}</pre>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

const alertService = new AlertService();

// Middleware para capturar errores críticos
const errorAlertMiddleware = (err, req, res, next) => {
  if (err.status >= 500) {
    alertService.sendAlert('critical', 'Server Error', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }
  
  next(err);
};

module.exports = { alertService, errorAlertMiddleware };
```

---

## Guía de Contribución

### Configuración del Entorno de Desarrollo

#### Prerrequisitos
```bash
# Node.js 18+
node --version

# npm o pnpm
npm --version

# Expo CLI
npm install -g @expo/eas-cli
npm install -g @expo/cli

# Git
git --version
```

#### Configuración Inicial
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/voluntarios-app.git
cd voluntarios-app

# Instalar dependencias del backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias del frontend móvil
cd ../frontend
npm install

# Instalar dependencias del dashboard web
cd ../dashboard-web
npm install
cp .env.example .env
# Editar .env con la URL de tu API
```

### Estándares de Código

#### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "@react-native-community",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error"
  },
  "env": {
    "node": true,
    "es6": true,
    "react-native/react-native": true
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Flujo de Trabajo Git

#### Branching Strategy
```bash
# Rama principal
main

# Ramas de desarrollo
develop

# Ramas de features
feature/nombre-del-feature

# Ramas de hotfix
hotfix/descripcion-del-fix

# Ramas de release
release/v1.0.0
```

#### Convención de Commits
```bash
# Formato
tipo(scope): descripción

# Tipos válidos
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan lógica)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento

# Ejemplos
feat(auth): agregar autenticación con JWT
fix(activities): corregir filtro por ubicación
docs(readme): actualizar instrucciones de instalación
```

### Testing

#### Jest Configuration
```json
{
  "preset": "react-native",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
  "testMatch": [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/index.js"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

#### Ejemplo de Test
```javascript
// __tests__/services/auth.test.js
import { authService } from '../src/services/auth';
import { apiClient } from '../src/services/api';

// Mock del API client
jest.mock('../src/services/api');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com', rol: 'voluntario' },
        session: { access_token: 'token', refresh_token: 'refresh' }
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@test.com', 'password');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with invalid credentials', async () => {
      const mockError = new Error('Credenciales inválidas');
      apiClient.post.mockRejectedValue(mockError);

      await expect(
        authService.login('test@test.com', 'wrongpassword')
      ).rejects.toThrow('Credenciales inválidas');
    });
  });
});
```

### Documentación

#### JSDoc para Funciones
```javascript
/**
 * Busca actividades cercanas a una ubicación específica
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {number} [radius=5] - Radio de búsqueda en kilómetros
 * @param {Object} [filters={}] - Filtros adicionales
 * @param {string} [filters.categoria] - Categoría de actividad
 * @param {string} [filters.estado] - Estado de la actividad
 * @returns {Promise<Array>} Lista de actividades encontradas
 * @throws {ApiError} Error si la petición falla
 * @example
 * const actividades = await searchNearbyActivities(14.6349, -90.5069, 10, {
 *   categoria: 'Educación',
 *   estado: 'abierta'
 * });
 */
async function searchNearbyActivities(latitude, longitude, radius = 5, filters = {}) {
  // Implementación...
}
```

### Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación (cambios solo en documentación)

## ¿Cómo se ha probado?
Describe las pruebas realizadas para verificar los cambios.

## Checklist:
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, especialmente en áreas complejas
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado pruebas que demuestran que mi corrección es efectiva
- [ ] Las pruebas nuevas y existentes pasan localmente

## Screenshots (si aplica):
Agregar capturas de pantalla para cambios en UI.
```

---

**Esta documentación técnica proporciona una guía completa para desarrolladores que trabajen en el proyecto VoluntariosGT. Se actualiza regularmente para reflejar los cambios en el sistema.**

*Versión: 1.0.0 - Agosto 2025*

