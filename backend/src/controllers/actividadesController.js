import { supabase, supabaseAdmin } from '../config.js';
import { validateActividad, sanitizeText } from '../utils/validation.js';
import { findNearbyActivities } from '../utils/geolocation.js';
import { notifyNewActivity } from '../services/oneSignalService.js';

/**
 * Obtiene todas las actividades disponibles
 */
export const getActividades = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      limite, // Dashboard compatibility
      orden, // Dashboard compatibility
      categoria, 
      estado = 'abierta',
      lat,
      lon,
      radio = 5,
      incluir_ubicacion = false
    } = req.query;

    // Handle dashboard compatibility
    const finalLimit = limite || limit;
    const orderBy = orden || 'fecha_inicio';

    // Seleccionar campos con entidades
    let selectFields = `
      *,
      entidades!inner(
        id,
        nombre_organizacion,
        tipo_organizacion
      )
    `;
    
    // Si se solicita ubicación, agregar coordenadas extraídas
    if (incluir_ubicacion) {
      selectFields += `,
      ST_X(ubicacion) as longitud,
      ST_Y(ubicacion) as latitud
      `;
    }

    let query = supabase
      .from('actividades')
      .select(selectFields);

    // Filter by estado only if specified
    if (estado && estado !== 'all') {
      query = query.eq('estado', estado);
    }

    // Handle different ordering options
    if (orderBy === 'fecha_creacion') {
      query = query.order('created_at', { ascending: false });
    } else if (orderBy === 'fecha_inicio') {
      query = query.order('fecha_inicio', { ascending: true });
    } else {
      query = query.order('fecha_inicio', { ascending: true });
    }

    // Filtrar por categoría si se especifica
    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(finalLimit);
    query = query.range(offset, offset + parseInt(finalLimit) - 1);

    const { data: actividades, error, count } = await query;

    if (error) {
      console.error('Error al obtener actividades:', error);
      // Return empty data to prevent dashboard errors
      return res.json({
        actividades: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(finalLimit),
          total: 0
        }
      });
    }

    let result = actividades || [];

    // Si se proporcionan coordenadas, filtrar por proximidad
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      const radiusKm = parseFloat(radio);

      // Convertir ubicaciones PostGIS a formato utilizable
      const actividadesConCoordenadas = result.map(actividad => {
        if (actividad.ubicacion) {
          // Extraer coordenadas del formato PostGIS
          const match = actividad.ubicacion.match(/POINT\(([^)]+)\)/);
          if (match) {
            const [lon, lat] = match[1].split(' ').map(Number);
            return {
              ...actividad,
              ubicacion: { lat, lon }
            };
          }
        }
        return actividad;
      });

      result = findNearbyActivities(actividadesConCoordenadas, userLat, userLon, radiusKm);
    }

    res.json({
      actividades: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(finalLimit),
        total: count || result.length
      }
    });

  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene una actividad específica por ID
 */
export const getActividadById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: actividad, error } = await supabase
      .from('actividades')
      .select(`
        *,
        entidades (
          id,
          nombre_organizacion,
          tipo_organizacion,
          descripcion,
          telefono_contacto,
          email_contacto,
          sitio_web,
          direccion_completa
        ),
        inscripciones (
          id,
          voluntario_id,
          estado,
          fecha_inscripcion,
          perfiles (
            nombre_completo,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada'
      });
    }

    res.json({
      actividad
    });

  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Crea una nueva actividad (solo entidades verificadas)
 */
export const createActividad = async (req, res) => {
  try {
    const userId = req.user?.id;
    const actividadData = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Validar datos de la actividad
    const validation = validateActividad(actividadData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Datos de actividad inválidos',
        details: validation.errors
      });
    }

    // Verificar que el usuario tenga una entidad verificada
    const { data: entidad, error: entidadError } = await supabase
      .from('entidades')
      .select('id, verificado')
      .eq('usuario_id', userId)
      .eq('verificado', true)
      .single();

    if (entidadError || !entidad) {
      return res.status(403).json({
        error: 'Solo las entidades verificadas pueden crear actividades'
      });
    }

    // Preparar datos para inserción
    const nuevaActividad = {
      entidad_id: entidad.id,
      titulo: sanitizeText(actividadData.titulo),
      descripcion: sanitizeText(actividadData.descripcion),
      categoria: actividadData.categoria || null,
      ubicacion: `POINT(${actividadData.ubicacion.lon} ${actividadData.ubicacion.lat})`,
      direccion_completa: sanitizeText(actividadData.direccion_completa),
      fecha_inicio: actividadData.fecha_inicio,
      fecha_fin: actividadData.fecha_fin,
      cupos_totales: parseInt(actividadData.cupos_totales),
      habilidades_requeridas: actividadData.habilidades_requeridas || [],
      beneficios: actividadData.beneficios || [],
      requisitos: actividadData.requisitos ? sanitizeText(actividadData.requisitos) : null,
      imagen_url: actividadData.imagen_url || null,
      contacto_responsable: actividadData.contacto_responsable ? sanitizeText(actividadData.contacto_responsable) : null,
      telefono_contacto: actividadData.telefono_contacto ? sanitizeText(actividadData.telefono_contacto) : null,
      instrucciones_especiales: actividadData.instrucciones_especiales ? sanitizeText(actividadData.instrucciones_especiales) : null
    };

    const { data: actividadCreada, error } = await supabase
      .from('actividades')
      .insert(nuevaActividad)
      .select(`
        *,
        entidades (
          nombre_organizacion,
          tipo_organizacion
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear actividad:', error);
      return res.status(500).json({
        error: 'Error al crear la actividad'
      });
    }

    // Enviar notificación de nueva actividad
    try {
      await notifyNewActivity({
        id: actividadCreada.id,
        titulo: actividadCreada.titulo,
        entidad_nombre: actividadCreada.entidades.nombre_organizacion,
        ubicacion_lat: actividadCreada.ubicacion_lat,
        ubicacion_lng: actividadCreada.ubicacion_lng
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
      // No fallar la creación por error de notificación
    }

    res.status(201).json({
      message: 'Actividad creada exitosamente',
      actividad: actividadCreada
    });

  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza una actividad existente
 */
export const updateActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que la actividad pertenezca al usuario
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select(`
        *,
        entidades (
          usuario_id
        )
      `)
      .eq('id', id)
      .single();

    if (actividadError || !actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada'
      });
    }

    if (actividad.entidades.usuario_id !== userId && req.user.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para modificar esta actividad'
      });
    }

    // Preparar datos de actualización
    const datosActualizacion = {};

    if (updateData.titulo) {
      datosActualizacion.titulo = sanitizeText(updateData.titulo);
    }
    if (updateData.descripcion) {
      datosActualizacion.descripcion = sanitizeText(updateData.descripcion);
    }
    if (updateData.categoria) {
      datosActualizacion.categoria = updateData.categoria;
    }
    if (updateData.ubicacion) {
      datosActualizacion.ubicacion = `POINT(${updateData.ubicacion.lon} ${updateData.ubicacion.lat})`;
    }
    if (updateData.direccion_completa) {
      datosActualizacion.direccion_completa = sanitizeText(updateData.direccion_completa);
    }
    if (updateData.fecha_inicio) {
      datosActualizacion.fecha_inicio = updateData.fecha_inicio;
    }
    if (updateData.fecha_fin) {
      datosActualizacion.fecha_fin = updateData.fecha_fin;
    }
    if (updateData.cupos_totales) {
      datosActualizacion.cupos_totales = parseInt(updateData.cupos_totales);
    }
    if (updateData.habilidades_requeridas) {
      datosActualizacion.habilidades_requeridas = updateData.habilidades_requeridas;
    }
    if (updateData.beneficios) {
      datosActualizacion.beneficios = updateData.beneficios;
    }
    if (updateData.requisitos) {
      datosActualizacion.requisitos = sanitizeText(updateData.requisitos);
    }
    if (updateData.imagen_url) {
      datosActualizacion.imagen_url = updateData.imagen_url;
    }
    if (updateData.contacto_responsable) {
      datosActualizacion.contacto_responsable = sanitizeText(updateData.contacto_responsable);
    }
    if (updateData.telefono_contacto) {
      datosActualizacion.telefono_contacto = sanitizeText(updateData.telefono_contacto);
    }
    if (updateData.instrucciones_especiales) {
      datosActualizacion.instrucciones_especiales = sanitizeText(updateData.instrucciones_especiales);
    }
    if (updateData.estado && ['abierta', 'cerrada', 'completada', 'cancelada'].includes(updateData.estado)) {
      datosActualizacion.estado = updateData.estado;
    }

    const { data: actividadActualizada, error } = await supabase
      .from('actividades')
      .update(datosActualizacion)
      .eq('id', id)
      .select(`
        *,
        entidades (
          nombre_organizacion,
          tipo_organizacion
        )
      `)
      .single();

    if (error) {
      console.error('Error al actualizar actividad:', error);
      return res.status(500).json({
        error: 'Error al actualizar la actividad'
      });
    }

    res.json({
      message: 'Actividad actualizada exitosamente',
      actividad: actividadActualizada
    });

  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina una actividad
 */
export const deleteActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que la actividad pertenezca al usuario
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select(`
        *,
        entidades (
          usuario_id
        )
      `)
      .eq('id', id)
      .single();

    if (actividadError || !actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada'
      });
    }

    if (actividad.entidades.usuario_id !== userId && req.user.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar esta actividad'
      });
    }

    // Verificar si hay inscripciones
    const { data: inscripciones, error: inscripcionesError } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('actividad_id', id);

    if (inscripcionesError) {
      console.error('Error al verificar inscripciones:', inscripcionesError);
      return res.status(500).json({
        error: 'Error al verificar inscripciones'
      });
    }

    if (inscripciones && inscripciones.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar una actividad con inscripciones. Cancélala en su lugar.'
      });
    }

    const { error } = await supabase
      .from('actividades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar actividad:', error);
      return res.status(500).json({
        error: 'Error al eliminar la actividad'
      });
    }

    res.json({
      message: 'Actividad eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Inscribirse a una actividad
 */
export const inscribirseActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { notas } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario sea voluntario o beneficiario
    if (!['voluntario', 'beneficiario'].includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Solo los voluntarios y beneficiarios pueden inscribirse a actividades'
      });
    }

    // Verificar que la actividad existe y está disponible
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select('*')
      .eq('id', id)
      .eq('estado', 'abierta')
      .gt('cupos_disponibles', 0)
      .gt('fecha_inicio', new Date().toISOString())
      .single();

    if (actividadError || !actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada o no disponible'
      });
    }

    // Verificar que no esté ya inscrito
    const { data: inscripcionExistente } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('actividad_id', id)
      .eq('voluntario_id', userId)
      .single();

    if (inscripcionExistente) {
      return res.status(400).json({
        error: 'Ya estás inscrito en esta actividad'
      });
    }

    // Crear inscripción
    const { data: inscripcion, error } = await supabase
      .from('inscripciones')
      .insert({
        actividad_id: id,
        voluntario_id: userId,
        notas: notas ? sanitizeText(notas) : null
      })
      .select(`
        *,
        actividades (
          titulo,
          fecha_inicio,
          direccion_completa
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear inscripción:', error);
      return res.status(500).json({
        error: 'Error al inscribirse en la actividad'
      });
    }

    res.status(201).json({
      message: 'Inscripción exitosa',
      inscripcion
    });

  } catch (error) {
    console.error('Error al inscribirse:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene las actividades de una entidad específica
 */
export const getActividadesByEntidad = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { estado, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Obtener entidad del usuario
    const { data: entidad, error: entidadError } = await supabase
      .from('entidades')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (entidadError || !entidad) {
      return res.status(404).json({
        error: 'Entidad no encontrada'
      });
    }

    let query = supabase
      .from('actividades')
      .select(`
        *,
        inscripciones (
          id,
          estado,
          voluntario_id,
          perfiles (
            nombre_completo,
            telefono,
            avatar_url
          )
        )
      `)
      .eq('entidad_id', entidad.id)
      .order('created_at', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: actividades, error, count } = await query;

    if (error) {
      console.error('Error al obtener actividades de entidad:', error);
      return res.status(500).json({
        error: 'Error al obtener actividades'
      });
    }

    res.json({
      actividades: actividades || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener actividades de entidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export default {
  getActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad,
  inscribirseActividad,
  getActividadesByEntidad
};

