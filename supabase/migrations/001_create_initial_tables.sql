-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum para tipos de usuario
CREATE TYPE user_role AS ENUM ('beneficiario', 'voluntario', 'entidad', 'admin');

-- Enum para estado de actividades
CREATE TYPE actividad_estado AS ENUM ('abierta', 'cerrada', 'completada', 'cancelada');

-- Enum para estado de verificación
CREATE TYPE verificacion_estado AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    dpi TEXT UNIQUE,
    dpi_foto_url TEXT,
    rol user_role NOT NULL DEFAULT 'voluntario',
    verificado BOOLEAN DEFAULT FALSE,
    estado_verificacion verificacion_estado DEFAULT 'pendiente',
    ubicacion GEOGRAPHY(POINT),
    direccion TEXT,
    fecha_nacimiento DATE,
    genero TEXT,
    habilidades TEXT[],
    disponibilidad JSONB, -- {"dias": ["lunes", "martes"], "horarios": ["mañana", "tarde"]}
    puntos_reputacion INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entidades (organizaciones que publican actividades)
CREATE TABLE entidades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    nombre_organizacion TEXT NOT NULL,
    tipo_organizacion TEXT NOT NULL, -- 'escuela', 'iglesia', 'hospital', 'municipalidad', etc.
    descripcion TEXT,
    documento_legal_url TEXT,
    telefono_contacto TEXT,
    email_contacto TEXT,
    sitio_web TEXT,
    ubicacion GEOGRAPHY(POINT),
    direccion_completa TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    estado_verificacion verificacion_estado DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE actividades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT, -- 'educacion', 'salud', 'medio_ambiente', 'construccion', etc.
    ubicacion GEOGRAPHY(POINT) NOT NULL,
    direccion_completa TEXT NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    cupos_totales INTEGER NOT NULL DEFAULT 1,
    cupos_ocupados INTEGER DEFAULT 0,
    cupos_disponibles INTEGER GENERATED ALWAYS AS (cupos_totales - cupos_ocupados) STORED,
    habilidades_requeridas TEXT[],
    beneficios TEXT[], -- ['almuerzo', 'certificado', 'transporte']
    requisitos TEXT,
    estado actividad_estado DEFAULT 'abierta',
    imagen_url TEXT,
    contacto_responsable TEXT,
    telefono_contacto TEXT,
    instrucciones_especiales TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cupos_validos CHECK (cupos_totales > 0),
    CONSTRAINT cupos_ocupados_validos CHECK (cupos_ocupados >= 0 AND cupos_ocupados <= cupos_totales),
    CONSTRAINT fechas_validas CHECK (fecha_fin > fecha_inicio)
);

-- Tabla de inscripciones a actividades
CREATE TABLE inscripciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'inscrito', -- 'inscrito', 'confirmado', 'completado', 'cancelado'
    notas TEXT,
    evidencia_url TEXT, -- Foto de evidencia al completar la actividad
    horas_completadas DECIMAL(4,2),
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentarios TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint para evitar inscripciones duplicadas
    UNIQUE(actividad_id, voluntario_id)
);

-- Tabla de certificados
CREATE TABLE certificados (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    numero_certificado TEXT UNIQUE NOT NULL,
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    horas_certificadas DECIMAL(4,2) NOT NULL,
    pdf_url TEXT,
    qr_code TEXT, -- Código QR para validación
    validado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'nueva_actividad', 'recordatorio', 'cambio_actividad', 'certificado_listo'
    leida BOOLEAN DEFAULT FALSE,
    datos_adicionales JSONB, -- Información extra como actividad_id, etc.
    fecha_programada TIMESTAMPTZ,
    enviada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reportes de actividad (para auditoría)
CREATE TABLE reportes_actividad (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id),
    accion TEXT NOT NULL, -- 'login', 'registro', 'inscripcion', 'completar_actividad', etc.
    detalles JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_perfiles_rol ON perfiles(rol);
CREATE INDEX idx_perfiles_verificado ON perfiles(verificado);
CREATE INDEX idx_perfiles_ubicacion ON perfiles USING GIST(ubicacion);

CREATE INDEX idx_entidades_verificado ON entidades(verificado);
CREATE INDEX idx_entidades_tipo ON entidades(tipo_organizacion);
CREATE INDEX idx_entidades_ubicacion ON entidades USING GIST(ubicacion);

CREATE INDEX idx_actividades_estado ON actividades(estado);
CREATE INDEX idx_actividades_fecha_inicio ON actividades(fecha_inicio);
CREATE INDEX idx_actividades_ubicacion ON actividades USING GIST(ubicacion);
CREATE INDEX idx_actividades_categoria ON actividades(categoria);
CREATE INDEX idx_actividades_cupos_disponibles ON actividades(cupos_disponibles);

CREATE INDEX idx_inscripciones_voluntario ON inscripciones(voluntario_id);
CREATE INDEX idx_inscripciones_actividad ON inscripciones(actividad_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);

CREATE INDEX idx_certificados_voluntario ON certificados(voluntario_id);
CREATE INDEX idx_certificados_numero ON certificados(numero_certificado);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entidades_updated_at BEFORE UPDATE ON entidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actividades_updated_at BEFORE UPDATE ON actividades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inscripciones_updated_at BEFORE UPDATE ON inscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

