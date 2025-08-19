-- Script simplificado para configurar VoluntariosGT
-- Ejecuta esto en el SQL Editor de Supabase

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para tipos de usuario
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('beneficiario', 'voluntario', 'entidad', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para estado de actividades
DO $$ BEGIN
    CREATE TYPE actividad_estado AS ENUM ('abierta', 'cerrada', 'completada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para estado de verificación
DO $$ BEGIN
    CREATE TYPE verificacion_estado AS ENUM ('pendiente', 'aprobada', 'rechazada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    dpi TEXT UNIQUE,
    dpi_foto_url TEXT,
    rol user_role NOT NULL DEFAULT 'voluntario',
    verificado BOOLEAN DEFAULT FALSE,
    estado_verificacion verificacion_estado DEFAULT 'pendiente',
    direccion TEXT,
    fecha_nacimiento DATE,
    genero TEXT,
    habilidades TEXT[],
    disponibilidad JSONB,
    puntos_reputacion INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entidades
CREATE TABLE IF NOT EXISTS entidades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    nombre_organizacion TEXT NOT NULL,
    tipo_organizacion TEXT NOT NULL,
    descripcion TEXT,
    documento_legal_url TEXT,
    telefono_contacto TEXT,
    email_contacto TEXT,
    sitio_web TEXT,
    direccion_completa TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    estado_verificacion verificacion_estado DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT,
    direccion_completa TEXT NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    cupos_totales INTEGER NOT NULL DEFAULT 1,
    cupos_ocupados INTEGER DEFAULT 0,
    cupos_disponibles INTEGER GENERATED ALWAYS AS (cupos_totales - cupos_ocupados) STORED,
    habilidades_requeridas TEXT[],
    beneficios TEXT[],
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

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'inscrito',
    notas TEXT,
    evidencia_url TEXT,
    horas_completadas DECIMAL(4,2),
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentarios TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(actividad_id, voluntario_id)
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificados (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
    voluntario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    numero_certificado TEXT UNIQUE NOT NULL,
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    horas_certificadas DECIMAL(4,2) NOT NULL,
    pdf_url TEXT,
    qr_code TEXT,
    validado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    datos_adicionales JSONB,
    fecha_programada TIMESTAMPTZ,
    enviada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permisivas para desarrollo)
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON perfiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON entidades FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON actividades FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON inscripciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON certificados FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON notificaciones FOR ALL USING (auth.role() = 'authenticated');

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);
CREATE INDEX IF NOT EXISTS idx_actividades_estado ON actividades(estado);
CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_inscripciones_voluntario ON inscripciones(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_actividad ON inscripciones(actividad_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_perfiles_updated_at ON perfiles;
CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entidades_updated_at ON entidades;
CREATE TRIGGER update_entidades_updated_at BEFORE UPDATE ON entidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_actividades_updated_at ON actividades;
CREATE TRIGGER update_actividades_updated_at BEFORE UPDATE ON actividades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inscripciones_updated_at ON inscripciones;
CREATE TRIGGER update_inscripciones_updated_at BEFORE UPDATE ON inscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();