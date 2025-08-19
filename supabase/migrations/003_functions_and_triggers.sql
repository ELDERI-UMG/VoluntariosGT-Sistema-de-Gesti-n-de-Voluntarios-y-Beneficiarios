-- Función para calcular distancia entre dos puntos geográficos (Haversine)
CREATE OR REPLACE FUNCTION calcular_distancia_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    R CONSTANT DOUBLE PRECISION := 6371; -- Radio de la Tierra en km
    dLat DOUBLE PRECISION;
    dLon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    
    a := sin(dLat/2) * sin(dLat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dLon/2) * sin(dLon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para actualizar cupos ocupados cuando se crea una inscripción
CREATE OR REPLACE FUNCTION actualizar_cupos_inscripcion()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar cupos ocupados
        UPDATE actividades 
        SET cupos_ocupados = cupos_ocupados + 1
        WHERE id = NEW.actividad_id;
        
        -- Cerrar actividad si se llenaron todos los cupos
        UPDATE actividades 
        SET estado = 'cerrada'
        WHERE id = NEW.actividad_id AND cupos_disponibles <= 0;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar cupos ocupados
        UPDATE actividades 
        SET cupos_ocupados = cupos_ocupados - 1
        WHERE id = OLD.actividad_id;
        
        -- Reabrir actividad si hay cupos disponibles y estaba cerrada
        UPDATE actividades 
        SET estado = 'abierta'
        WHERE id = OLD.actividad_id 
        AND estado = 'cerrada' 
        AND cupos_disponibles > 0
        AND fecha_inicio > NOW();
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar cupos automáticamente
CREATE TRIGGER trigger_actualizar_cupos
    AFTER INSERT OR DELETE ON inscripciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_cupos_inscripcion();

-- Función para generar número de certificado único
CREATE OR REPLACE FUNCTION generar_numero_certificado()
RETURNS TEXT AS $$
DECLARE
    numero TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Generar número con formato: CERT-YYYY-XXXXXX
        numero := 'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                 LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        
        -- Verificar si ya existe
        SELECT EXISTS(SELECT 1 FROM certificados WHERE numero_certificado = numero) INTO existe;
        
        -- Si no existe, salir del loop
        IF NOT existe THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Función para crear certificado automáticamente cuando se completa una actividad
CREATE OR REPLACE FUNCTION crear_certificado_automatico()
RETURNS TRIGGER AS $$
DECLARE
    numero_cert TEXT;
    horas_actividad DECIMAL(4,2);
BEGIN
    -- Solo crear certificado si el estado cambió a 'completado'
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        
        -- Calcular horas de la actividad
        SELECT EXTRACT(EPOCH FROM (a.fecha_fin - a.fecha_inicio)) / 3600
        INTO horas_actividad
        FROM actividades a
        WHERE a.id = NEW.actividad_id;
        
        -- Usar las horas completadas si están especificadas, sino usar las horas de la actividad
        IF NEW.horas_completadas IS NULL THEN
            NEW.horas_completadas := horas_actividad;
        END IF;
        
        -- Generar número de certificado
        numero_cert := generar_numero_certificado();
        
        -- Crear el certificado
        INSERT INTO certificados (
            inscripcion_id,
            voluntario_id,
            actividad_id,
            numero_certificado,
            horas_certificadas,
            qr_code
        ) VALUES (
            NEW.id,
            NEW.voluntario_id,
            NEW.actividad_id,
            numero_cert,
            NEW.horas_completadas,
            numero_cert -- El QR contendrá el número de certificado para validación
        );
        
        -- Actualizar puntos de reputación del voluntario
        UPDATE perfiles 
        SET puntos_reputacion = puntos_reputacion + CEIL(NEW.horas_completadas)
        WHERE id = NEW.voluntario_id;
        
        -- Crear notificación para el voluntario
        INSERT INTO notificaciones (
            usuario_id,
            titulo,
            mensaje,
            tipo,
            datos_adicionales
        ) VALUES (
            NEW.voluntario_id,
            'Certificado disponible',
            'Tu certificado de participación está listo para descargar.',
            'certificado_listo',
            jsonb_build_object('certificado_numero', numero_cert, 'actividad_id', NEW.actividad_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear certificados automáticamente
CREATE TRIGGER trigger_crear_certificado
    AFTER UPDATE ON inscripciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_certificado_automatico();

-- Función para registrar actividad del usuario
CREATE OR REPLACE FUNCTION registrar_actividad_usuario(
    p_usuario_id UUID,
    p_accion TEXT,
    p_detalles JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO reportes_actividad (
        usuario_id,
        accion,
        detalles,
        ip_address,
        user_agent
    ) VALUES (
        p_usuario_id,
        p_accion,
        p_detalles,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar actividades cercanas
CREATE OR REPLACE FUNCTION buscar_actividades_cercanas(
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_radio_km DOUBLE PRECISION DEFAULT 5,
    p_limite INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    titulo TEXT,
    descripcion TEXT,
    categoria TEXT,
    direccion_completa TEXT,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    cupos_disponibles INTEGER,
    distancia_km DOUBLE PRECISION,
    entidad_nombre TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.titulo,
        a.descripcion,
        a.categoria,
        a.direccion_completa,
        a.fecha_inicio,
        a.fecha_fin,
        a.cupos_disponibles,
        calcular_distancia_km(
            p_lat, p_lon,
            ST_Y(a.ubicacion::geometry), ST_X(a.ubicacion::geometry)
        ) as distancia_km,
        e.nombre_organizacion as entidad_nombre
    FROM actividades a
    JOIN entidades e ON a.entidad_id = e.id
    WHERE 
        a.estado = 'abierta'
        AND a.cupos_disponibles > 0
        AND a.fecha_inicio > NOW()
        AND calcular_distancia_km(
            p_lat, p_lon,
            ST_Y(a.ubicacion::geometry), ST_X(a.ubicacion::geometry)
        ) <= p_radio_km
    ORDER BY distancia_km ASC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de impacto
CREATE OR REPLACE FUNCTION obtener_estadisticas_impacto()
RETURNS TABLE (
    total_voluntarios BIGINT,
    total_beneficiarios BIGINT,
    total_entidades BIGINT,
    total_actividades BIGINT,
    actividades_completadas BIGINT,
    total_horas_voluntariado NUMERIC,
    total_certificados BIGINT,
    promedio_calificacion NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM perfiles WHERE rol = 'voluntario') as total_voluntarios,
        (SELECT COUNT(*) FROM perfiles WHERE rol = 'beneficiario') as total_beneficiarios,
        (SELECT COUNT(*) FROM entidades WHERE verificado = true) as total_entidades,
        (SELECT COUNT(*) FROM actividades) as total_actividades,
        (SELECT COUNT(*) FROM actividades WHERE estado = 'completada') as actividades_completadas,
        (SELECT COALESCE(SUM(horas_certificadas), 0) FROM certificados) as total_horas_voluntariado,
        (SELECT COUNT(*) FROM certificados) as total_certificados,
        (SELECT COALESCE(AVG(calificacion), 0) FROM inscripciones WHERE calificacion IS NOT NULL) as promedio_calificacion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar DPI guatemalteco
CREATE OR REPLACE FUNCTION validar_dpi(dpi_numero TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    digitos INTEGER[];
    suma INTEGER := 0;
    digito_verificador INTEGER;
    i INTEGER;
BEGIN
    -- Verificar que tenga exactamente 13 dígitos
    IF LENGTH(dpi_numero) != 13 OR dpi_numero !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Convertir a array de enteros
    FOR i IN 1..13 LOOP
        digitos[i] := SUBSTRING(dpi_numero FROM i FOR 1)::INTEGER;
    END LOOP;
    
    -- Calcular suma de verificación
    FOR i IN 1..12 LOOP
        suma := suma + digitos[i];
    END LOOP;
    
    -- Calcular dígito verificador
    digito_verificador := suma % 10;
    
    -- Verificar que coincida con el último dígito
    RETURN digito_verificador = digitos[13];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para crear notificación de recordatorio
CREATE OR REPLACE FUNCTION crear_recordatorio_actividad()
RETURNS VOID AS $$
BEGIN
    -- Crear notificaciones de recordatorio 24 horas antes de cada actividad
    INSERT INTO notificaciones (
        usuario_id,
        titulo,
        mensaje,
        tipo,
        datos_adicionales,
        fecha_programada
    )
    SELECT 
        i.voluntario_id,
        'Recordatorio de actividad',
        'Tienes una actividad mañana: ' || a.titulo || ' a las ' || 
        TO_CHAR(a.fecha_inicio, 'HH24:MI') || ' en ' || a.direccion_completa,
        'recordatorio',
        jsonb_build_object('actividad_id', a.id, 'inscripcion_id', i.id),
        a.fecha_inicio - INTERVAL '24 hours'
    FROM inscripciones i
    JOIN actividades a ON i.actividad_id = a.id
    WHERE 
        i.estado = 'inscrito'
        AND a.fecha_inicio > NOW() + INTERVAL '23 hours'
        AND a.fecha_inicio <= NOW() + INTERVAL '25 hours'
        AND NOT EXISTS (
            SELECT 1 FROM notificaciones n 
            WHERE n.usuario_id = i.voluntario_id 
            AND n.tipo = 'recordatorio'
            AND (n.datos_adicionales->>'actividad_id')::UUID = a.id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

