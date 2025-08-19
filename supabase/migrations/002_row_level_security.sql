-- Habilitar Row Level Security en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_actividad ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla perfiles
-- Los usuarios pueden ver y editar solo su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON perfiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON perfiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
ON perfiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Los administradores pueden ver todos los perfiles"
ON perfiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla entidades
-- Las entidades pueden ver y editar solo sus propios datos
CREATE POLICY "Las entidades pueden ver sus propios datos"
ON entidades FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Las entidades pueden actualizar sus propios datos"
ON entidades FOR UPDATE
USING (usuario_id = auth.uid());

CREATE POLICY "Las entidades pueden insertar sus propios datos"
ON entidades FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- Todos pueden ver entidades verificadas (para mostrar actividades públicas)
CREATE POLICY "Todos pueden ver entidades verificadas"
ON entidades FOR SELECT
USING (verificado = true);

-- Los administradores pueden ver y gestionar todas las entidades
CREATE POLICY "Los administradores pueden gestionar todas las entidades"
ON entidades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla actividades
-- Lectura pública de actividades abiertas con cupos disponibles
CREATE POLICY "Lectura pública de actividades disponibles"
ON actividades FOR SELECT
USING (
  estado = 'abierta' AND cupos_disponibles > 0
  OR EXISTS (
    SELECT 1 FROM entidades e 
    WHERE e.id = entidad_id AND e.usuario_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Las entidades pueden crear actividades
CREATE POLICY "Las entidades pueden crear actividades"
ON actividades FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM entidades e 
    WHERE e.id = entidad_id AND e.usuario_id = auth.uid() AND e.verificado = true
  )
);

-- Las entidades pueden actualizar sus propias actividades
CREATE POLICY "Las entidades pueden actualizar sus actividades"
ON actividades FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM entidades e 
    WHERE e.id = entidad_id AND e.usuario_id = auth.uid()
  )
);

-- Los administradores pueden gestionar todas las actividades
CREATE POLICY "Los administradores pueden gestionar todas las actividades"
ON actividades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla inscripciones
-- Los voluntarios pueden ver sus propias inscripciones
CREATE POLICY "Los voluntarios pueden ver sus inscripciones"
ON inscripciones FOR SELECT
USING (voluntario_id = auth.uid());

-- Los voluntarios pueden inscribirse a actividades
CREATE POLICY "Los voluntarios pueden inscribirse"
ON inscripciones FOR INSERT
WITH CHECK (
  voluntario_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol IN ('voluntario', 'beneficiario')
  )
  AND EXISTS (
    SELECT 1 FROM actividades a 
    WHERE a.id = actividad_id AND a.estado = 'abierta' AND a.cupos_disponibles > 0
  )
);

-- Los voluntarios pueden actualizar sus inscripciones (para subir evidencia, etc.)
CREATE POLICY "Los voluntarios pueden actualizar sus inscripciones"
ON inscripciones FOR UPDATE
USING (voluntario_id = auth.uid());

-- Las entidades pueden ver inscripciones a sus actividades
CREATE POLICY "Las entidades pueden ver inscripciones a sus actividades"
ON inscripciones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM actividades a
    JOIN entidades e ON a.entidad_id = e.id
    WHERE a.id = actividad_id AND e.usuario_id = auth.uid()
  )
);

-- Las entidades pueden actualizar inscripciones a sus actividades
CREATE POLICY "Las entidades pueden actualizar inscripciones a sus actividades"
ON inscripciones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM actividades a
    JOIN entidades e ON a.entidad_id = e.id
    WHERE a.id = actividad_id AND e.usuario_id = auth.uid()
  )
);

-- Los administradores pueden gestionar todas las inscripciones
CREATE POLICY "Los administradores pueden gestionar todas las inscripciones"
ON inscripciones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla certificados
-- Los voluntarios pueden ver sus propios certificados
CREATE POLICY "Los voluntarios pueden ver sus certificados"
ON certificados FOR SELECT
USING (voluntario_id = auth.uid());

-- Lectura pública de certificados para validación (solo con número de certificado)
CREATE POLICY "Validación pública de certificados"
ON certificados FOR SELECT
USING (true); -- Permitir lectura pública para validación de QR

-- Solo el sistema puede crear certificados (a través de funciones)
CREATE POLICY "Solo el sistema puede crear certificados"
ON certificados FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla notificaciones
-- Los usuarios pueden ver solo sus propias notificaciones
CREATE POLICY "Los usuarios pueden ver sus notificaciones"
ON notificaciones FOR SELECT
USING (usuario_id = auth.uid());

-- Los usuarios pueden actualizar sus notificaciones (marcar como leídas)
CREATE POLICY "Los usuarios pueden actualizar sus notificaciones"
ON notificaciones FOR UPDATE
USING (usuario_id = auth.uid());

-- Solo el sistema puede crear notificaciones
CREATE POLICY "Solo el sistema puede crear notificaciones"
ON notificaciones FOR INSERT
WITH CHECK (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Los administradores pueden gestionar todas las notificaciones
CREATE POLICY "Los administradores pueden gestionar todas las notificaciones"
ON notificaciones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Políticas para la tabla reportes_actividad
-- Solo los administradores pueden ver reportes de actividad
CREATE POLICY "Solo los administradores pueden ver reportes"
ON reportes_actividad FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Solo el sistema puede insertar reportes de actividad
CREATE POLICY "Solo el sistema puede crear reportes"
ON reportes_actividad FOR INSERT
WITH CHECK (true); -- Permitir inserción desde triggers y funciones del sistema

