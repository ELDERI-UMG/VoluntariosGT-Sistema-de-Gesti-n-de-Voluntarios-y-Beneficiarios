import { supabase } from '../config.js';
import { config } from '../config.js';

/**
 * Obtiene las notificaciones del usuario
 */
export const getNotificaciones = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { leida, tipo, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    let query = supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    // Filtros opcionales
    if (leida !== undefined) {
      query = query.eq('leida', leida === 'true');
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: notificaciones, error, count } = await query;

    if (error) {
      console.error('Error al obtener notificaciones:', error);
      return res.status(500).json({
        error: 'Error al obtener notificaciones'
      });
    }

    res.json({
      notificaciones: notificaciones || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Marca una notificación como leída
 */
export const marcarComoLeida = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { data: notificacion, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificacionId)
      .eq('usuario_id', userId)
      .select()
      .single();

    if (error || !notificacion) {
      return res.status(404).json({
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      message: 'Notificación marcada como leída',
      notificacion
    });

  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Marca todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', userId)
      .eq('leida', false);

    if (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      return res.status(500).json({
        error: 'Error al marcar notificaciones como leídas'
      });
    }

    res.json({
      message: 'Todas las notificaciones han sido marcadas como leídas'
    });

  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina una notificación
 */
export const eliminarNotificacion = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', notificacionId)
      .eq('usuario_id', userId);

    if (error) {
      console.error('Error al eliminar notificación:', error);
      return res.status(500).json({
        error: 'Error al eliminar la notificación'
      });
    }

    res.json({
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene el conteo de notificaciones no leídas
 */
export const getConteoNoLeidas = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .eq('leida', false);

    if (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
      return res.status(500).json({
        error: 'Error al obtener conteo de notificaciones'
      });
    }

    res.json({
      conteo_no_leidas: count || 0
    });

  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Crea una nueva notificación (solo para admins o sistema)
 */
export const crearNotificacion = async (req, res) => {
  try {
    const {
      usuario_id,
      titulo,
      mensaje,
      tipo,
      datos_adicionales,
      fecha_programada
    } = req.body;

    // Solo admins pueden crear notificaciones manualmente
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para crear notificaciones'
      });
    }

    if (!usuario_id || !titulo || !mensaje || !tipo) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: usuario_id, titulo, mensaje, tipo'
      });
    }

    const { data: notificacion, error } = await supabase
      .from('notificaciones')
      .insert({
        usuario_id,
        titulo,
        mensaje,
        tipo,
        datos_adicionales: datos_adicionales || null,
        fecha_programada: fecha_programada || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear notificación:', error);
      return res.status(500).json({
        error: 'Error al crear la notificación'
      });
    }

    res.status(201).json({
      message: 'Notificación creada exitosamente',
      notificacion
    });

  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Envía notificación push usando OneSignal
 */
export const enviarNotificacionPush = async (userId, titulo, mensaje, datos = {}) => {
  try {
    if (!config.oneSignal.appId || !config.oneSignal.restApiKey) {
      console.warn('OneSignal no configurado, saltando notificación push');
      return;
    }

    // Obtener external_user_id (en este caso, el UUID del usuario)
    const notificationData = {
      app_id: config.oneSignal.appId,
      include_external_user_ids: [userId],
      headings: { es: titulo },
      contents: { es: mensaje },
      data: datos
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${config.oneSignal.restApiKey}`
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      console.error('Error al enviar notificación push:', await response.text());
    } else {
      console.log('Notificación push enviada exitosamente');
    }

  } catch (error) {
    console.error('Error al enviar notificación push:', error);
  }
};

/**
 * Procesa notificaciones programadas (para ser llamado por cron job)
 */
export const procesarNotificacionesProgramadas = async (req, res) => {
  try {
    // Solo admins pueden ejecutar este endpoint
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para ejecutar esta acción'
      });
    }

    const ahora = new Date();

    // Obtener notificaciones programadas que deben enviarse
    const { data: notificacionesPendientes, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('enviada', false)
      .not('fecha_programada', 'is', null)
      .lte('fecha_programada', ahora.toISOString());

    if (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return res.status(500).json({
        error: 'Error al obtener notificaciones programadas'
      });
    }

    let procesadas = 0;

    for (const notificacion of notificacionesPendientes || []) {
      try {
        // Enviar notificación push
        await enviarNotificacionPush(
          notificacion.usuario_id,
          notificacion.titulo,
          notificacion.mensaje,
          notificacion.datos_adicionales || {}
        );

        // Marcar como enviada
        await supabase
          .from('notificaciones')
          .update({ enviada: true })
          .eq('id', notificacion.id);

        procesadas++;
      } catch (error) {
        console.error(`Error al procesar notificación ${notificacion.id}:`, error);
      }
    }

    res.json({
      message: `${procesadas} notificaciones procesadas exitosamente`
    });

  } catch (error) {
    console.error('Error al procesar notificaciones programadas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export default {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  getConteoNoLeidas,
  crearNotificacion,
  enviarNotificacionPush,
  procesarNotificacionesProgramadas
};

