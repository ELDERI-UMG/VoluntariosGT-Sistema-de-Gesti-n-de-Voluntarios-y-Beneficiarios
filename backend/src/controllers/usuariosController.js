import { supabase, supabaseAdmin } from '../config.js';
import { sanitizeText, validateDPI } from '../utils/validation.js';

/**
 * Obtiene las inscripciones del usuario actual
 */
export const getMisInscripciones = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { estado, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    let query = supabase
      .from('inscripciones')
      .select(`
        *,
        actividades (
          id,
          titulo,
          descripcion,
          categoria,
          fecha_inicio,
          fecha_fin,
          direccion_completa,
          estado,
          entidades (
            nombre_organizacion,
            telefono_contacto
          )
        )
      `)
      .eq('voluntario_id', userId)
      .order('created_at', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: inscripciones, error, count } = await query;

    if (error) {
      console.error('Error al obtener inscripciones:', error);
      return res.status(500).json({
        error: 'Error al obtener inscripciones'
      });
    }

    res.json({
      inscripciones: inscripciones || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Cancela una inscripción del usuario
 */
export const cancelarInscripcion = async (req, res) => {
  try {
    const { inscripcionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que la inscripción pertenezca al usuario
    const { data: inscripcion, error: inscripcionError } = await supabase
      .from('inscripciones')
      .select(`
        *,
        actividades (
          fecha_inicio,
          titulo
        )
      `)
      .eq('id', inscripcionId)
      .eq('voluntario_id', userId)
      .single();

    if (inscripcionError || !inscripcion) {
      return res.status(404).json({
        error: 'Inscripción no encontrada'
      });
    }

    // Verificar que la actividad no haya comenzado
    const ahora = new Date();
    const fechaInicio = new Date(inscripcion.actividades.fecha_inicio);

    if (fechaInicio <= ahora) {
      return res.status(400).json({
        error: 'No se puede cancelar una inscripción después de que la actividad haya comenzado'
      });
    }

    // Actualizar estado de la inscripción
    const { data: inscripcionActualizada, error } = await supabase
      .from('inscripciones')
      .update({ estado: 'cancelado' })
      .eq('id', inscripcionId)
      .select()
      .single();

    if (error) {
      console.error('Error al cancelar inscripción:', error);
      return res.status(500).json({
        error: 'Error al cancelar la inscripción'
      });
    }

    res.json({
      message: 'Inscripción cancelada exitosamente',
      inscripcion: inscripcionActualizada
    });

  } catch (error) {
    console.error('Error al cancelar inscripción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Sube evidencia de participación en una actividad
 */
export const subirEvidencia = async (req, res) => {
  try {
    const { inscripcionId } = req.params;
    const { evidencia_url, horas_completadas, comentarios } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que la inscripción pertenezca al usuario
    const { data: inscripcion, error: inscripcionError } = await supabase
      .from('inscripciones')
      .select(`
        *,
        actividades (
          fecha_fin,
          titulo
        )
      `)
      .eq('id', inscripcionId)
      .eq('voluntario_id', userId)
      .single();

    if (inscripcionError || !inscripcion) {
      return res.status(404).json({
        error: 'Inscripción no encontrada'
      });
    }

    // Verificar que la actividad haya terminado
    const ahora = new Date();
    const fechaFin = new Date(inscripcion.actividades.fecha_fin);

    if (fechaFin > ahora) {
      return res.status(400).json({
        error: 'Solo se puede subir evidencia después de que termine la actividad'
      });
    }

    // Actualizar inscripción con evidencia
    const updateData = {
      estado: 'completado',
      evidencia_url: evidencia_url || null,
      horas_completadas: horas_completadas ? parseFloat(horas_completadas) : null,
      comentarios: comentarios ? sanitizeText(comentarios) : null
    };

    const { data: inscripcionActualizada, error } = await supabase
      .from('inscripciones')
      .update(updateData)
      .eq('id', inscripcionId)
      .select()
      .single();

    if (error) {
      console.error('Error al subir evidencia:', error);
      return res.status(500).json({
        error: 'Error al subir evidencia'
      });
    }

    res.json({
      message: 'Evidencia subida exitosamente. Se generará tu certificado automáticamente.',
      inscripcion: inscripcionActualizada
    });

  } catch (error) {
    console.error('Error al subir evidencia:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene los certificados del usuario
 */
export const getMisCertificados = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    let query = supabase
      .from('certificados')
      .select(`
        *,
        actividades (
          titulo,
          categoria,
          fecha_inicio,
          fecha_fin,
          entidades (
            nombre_organizacion
          )
        )
      `)
      .eq('voluntario_id', userId)
      .order('fecha_emision', { ascending: false });

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: certificados, error, count } = await query;

    if (error) {
      console.error('Error al obtener certificados:', error);
      return res.status(500).json({
        error: 'Error al obtener certificados'
      });
    }

    res.json({
      certificados: certificados || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener certificados:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Crea o actualiza una entidad para el usuario actual
 */
export const crearEntidad = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      nombre_organizacion,
      tipo_organizacion,
      descripcion,
      telefono_contacto,
      email_contacto,
      sitio_web,
      ubicacion,
      direccion_completa,
      documento_legal_url
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Validaciones básicas
    if (!nombre_organizacion || nombre_organizacion.trim().length < 3) {
      return res.status(400).json({
        error: 'El nombre de la organización debe tener al menos 3 caracteres'
      });
    }

    if (!tipo_organizacion) {
      return res.status(400).json({
        error: 'El tipo de organización es requerido'
      });
    }

    // Verificar si ya existe una entidad para este usuario
    const { data: entidadExistente } = await supabase
      .from('entidades')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    const entidadData = {
      usuario_id: userId,
      nombre_organizacion: sanitizeText(nombre_organizacion),
      tipo_organizacion: sanitizeText(tipo_organizacion),
      descripcion: descripcion ? sanitizeText(descripcion) : null,
      telefono_contacto: telefono_contacto ? sanitizeText(telefono_contacto) : null,
      email_contacto: email_contacto ? sanitizeText(email_contacto) : null,
      sitio_web: sitio_web ? sanitizeText(sitio_web) : null,
      ubicacion: ubicacion ? `POINT(${ubicacion.lon} ${ubicacion.lat})` : null,
      direccion_completa: direccion_completa ? sanitizeText(direccion_completa) : null,
      documento_legal_url: documento_legal_url || null
    };

    let result;
    let message;

    if (entidadExistente) {
      // Actualizar entidad existente
      const { data: entidadActualizada, error } = await supabase
        .from('entidades')
        .update(entidadData)
        .eq('id', entidadExistente.id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar entidad:', error);
        return res.status(500).json({
          error: 'Error al actualizar la entidad'
        });
      }

      result = entidadActualizada;
      message = 'Entidad actualizada exitosamente';
    } else {
      // Crear nueva entidad
      const { data: entidadCreada, error } = await supabase
        .from('entidades')
        .insert(entidadData)
        .select()
        .single();

      if (error) {
        console.error('Error al crear entidad:', error);
        return res.status(500).json({
          error: 'Error al crear la entidad'
        });
      }

      result = entidadCreada;
      message = 'Entidad creada exitosamente';

      // Actualizar rol del usuario a 'entidad'
      await supabase
        .from('perfiles')
        .update({ rol: 'entidad' })
        .eq('id', userId);
    }

    res.status(entidadExistente ? 200 : 201).json({
      message,
      entidad: result
    });

  } catch (error) {
    console.error('Error al crear/actualizar entidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene la entidad del usuario actual
 */
export const getMiEntidad = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { data: entidad, error } = await supabase
      .from('entidades')
      .select('*')
      .eq('usuario_id', userId)
      .single();

    if (error || !entidad) {
      return res.status(404).json({
        error: 'Entidad no encontrada'
      });
    }

    res.json({
      entidad
    });

  } catch (error) {
    console.error('Error al obtener entidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el DPI del usuario (con validación)
 */
export const actualizarDPI = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { dpi, dpi_foto_url } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Validar DPI
    if (!dpi || !validateDPI(dpi)) {
      return res.status(400).json({
        error: 'Número de DPI inválido'
      });
    }

    // Verificar que el DPI no esté ya en uso
    const { data: dpiExistente } = await supabase
      .from('perfiles')
      .select('id')
      .eq('dpi', dpi)
      .neq('id', userId)
      .single();

    if (dpiExistente) {
      return res.status(400).json({
        error: 'Este número de DPI ya está registrado por otro usuario'
      });
    }

    // Actualizar perfil
    const updateData = {
      dpi,
      dpi_foto_url: dpi_foto_url || null,
      estado_verificacion: 'pendiente' // Resetear verificación al cambiar DPI
    };

    const { data: perfilActualizado, error } = await supabase
      .from('perfiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar DPI:', error);
      return res.status(500).json({
        error: 'Error al actualizar DPI'
      });
    }

    res.json({
      message: 'DPI actualizado exitosamente. Tu cuenta será revisada para verificación.',
      perfil: perfilActualizado
    });

  } catch (error) {
    console.error('Error al actualizar DPI:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene estadísticas administrativas del sistema
 */
export const getEstadisticasAdmin = async (req, res) => {
  try {
    // Obtener estadísticas básicas del sistema
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('perfiles')
      .select('tipo_usuario', { count: 'exact' });

    const { data: actividades, error: actividadesError } = await supabaseAdmin
      .from('actividades')
      .select('estado_actividad', { count: 'exact' });

    const { data: inscripciones, error: inscripcionesError } = await supabaseAdmin
      .from('inscripciones')
      .select('estado', { count: 'exact' });

    if (usuariosError || actividadesError || inscripcionesError) {
      console.error('Error obteniendo estadísticas:', { usuariosError, actividadesError, inscripcionesError });
      return res.status(500).json({
        error: 'Error al obtener estadísticas del sistema'
      });
    }

    // Procesar estadísticas de usuarios
    const estadisticasUsuarios = usuarios.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1;
      return acc;
    }, {});

    // Procesar estadísticas de actividades
    const estadisticasActividades = actividades.reduce((acc, actividad) => {
      acc[actividad.estado_actividad] = (acc[actividad.estado_actividad] || 0) + 1;
      return acc;
    }, {});

    // Procesar estadísticas de inscripciones
    const estadisticasInscripciones = inscripciones.reduce((acc, inscripcion) => {
      acc[inscripcion.estado] = (acc[inscripcion.estado] || 0) + 1;
      return acc;
    }, {});

    const respuesta = {
      usuarios: {
        total: usuarios.length,
        por_tipo: estadisticasUsuarios
      },
      actividades: {
        total: actividades.length,
        por_estado: estadisticasActividades
      },
      inscripciones: {
        total: inscripciones.length,
        por_estado: estadisticasInscripciones
      },
      resumen: {
        usuarios_totales: usuarios.length,
        actividades_activas: estadisticasActividades.activa || 0,
        inscripciones_confirmadas: estadisticasInscripciones.confirmada || 0
      }
    };

    res.json(respuesta);

  } catch (error) {
    console.error('Error en getEstadisticasAdmin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export default {
  getMisInscripciones,
  cancelarInscripcion,
  subirEvidencia,
  getMisCertificados,
  crearEntidad,
  getMiEntidad,
  actualizarDPI,
  getEstadisticasAdmin
};

