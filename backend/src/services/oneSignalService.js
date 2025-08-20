import { oneSignalMCP } from './oneSignalMCP.js';

/**
 * Envía una notificación push a usuarios específicos
 */
export const sendNotificationToUsers = async (userIds, title, message, data = {}) => {
  try {
    const notification = {
      contents: { 
        en: message, 
        es: message 
      },
      headings: { 
        en: title, 
        es: title 
      },
      include_external_user_ids: userIds,
      data: data,
      android_group: 'voluntarios_gt',
      ios_category: 'VOLUNTARIOS_CATEGORY'
    };

    const response = await oneSignalMCP.sendAdvancedNotification(notification);
    console.log('Notificación enviada:', response);
    return response;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    throw error;
  }
};

/**
 * Envía notificación a todos los usuarios con un tag específico
 */
export const sendNotificationByTag = async (tagKey, tagValue, title, message, data = {}) => {
  try {
    const notification = {
      contents: { en: message, es: message },
      headings: { en: title, es: title },
      filters: [
        { field: 'tag', key: tagKey, relation: '=', value: tagValue }
      ],
      data: data,
      android_group: 'voluntarios_gt',
      ios_category: 'VOLUNTARIOS_CATEGORY'
    };

    const response = await client.createNotification(notification);
    console.log('Notificación por tag enviada:', response.body);
    return response.body;
  } catch (error) {
    console.error('Error enviando notificación por tag:', error);
    throw error;
  }
};

/**
 * Envía notificación a usuarios en un radio geográfico
 */
export const sendLocationBasedNotification = async (lat, lng, radius, title, message, data = {}) => {
  try {
    const notification = {
      contents: { en: message, es: message },
      headings: { en: title, es: title },
      filters: [
        { field: 'location', radius: radius, lat: lat, long: lng }
      ],
      data: data,
      android_group: 'voluntarios_gt',
      ios_category: 'VOLUNTARIOS_CATEGORY'
    };

    const response = await client.createNotification(notification);
    console.log('Notificación geolocalizada enviada:', response.body);
    return response.body;
  } catch (error) {
    console.error('Error enviando notificación geolocalizada:', error);
    throw error;
  }
};

/**
 * Funciones específicas para el sistema de voluntarios
 */

// Notificar nueva actividad disponible con segmentación inteligente
export const notifyNewActivity = async (activityData, userTags = []) => {
  try {
    return await oneSignalMCP.notifyNewActivitySmart({
      id: activityData.id,
      title: activityData.titulo,
      entityName: activityData.entidad_nombre,
      municipality: activityData.municipio || 'Guatemala',
      lat: activityData.ubicacion_lat,
      lng: activityData.ubicacion_lng,
      categories: activityData.categoria ? [activityData.categoria] : [],
      radiusKm: 10 // Radio de búsqueda en kilómetros
    });
  } catch (error) {
    console.error('Error enviando notificación inteligente:', error);
    // Fallback a método tradicional
    const title = 'Nueva Actividad Disponible';
    const message = `${activityData.titulo} - ${activityData.entidad_nombre}`;
    return await sendNotificationToUsers([], title, message, {
      type: 'new_activity',
      activity_id: activityData.id
    });
  }
};

// Notificar inscripción aceptada
export const notifyInscriptionAccepted = async (userId, activityData) => {
  const title = 'Inscripción Aceptada';
  const message = `Tu inscripción para "${activityData.titulo}" ha sido aceptada`;
  
  return await sendNotificationToUsers([userId], title, message, {
    type: 'inscription_accepted',
    activity_id: activityData.id
  });
};

// Notificar recordatorio de actividad
export const notifyActivityReminder = async (userIds, activityData) => {
  const title = 'Recordatorio de Actividad';
  const message = `La actividad "${activityData.titulo}" comienza mañana`;
  
  return await sendNotificationToUsers(userIds, title, message, {
    type: 'activity_reminder',
    activity_id: activityData.id
  });
};

// Notificar certificado disponible
export const notifyCertificateReady = async (userId, certificateData) => {
  const title = 'Certificado Disponible';
  const message = `Tu certificado para "${certificateData.actividad_titulo}" está listo`;
  
  return await sendNotificationToUsers([userId], title, message, {
    type: 'certificate_ready',
    certificate_id: certificateData.id
  });
};

export default {
  sendNotificationToUsers,
  sendNotificationByTag,
  sendLocationBasedNotification,
  notifyNewActivity,
  notifyInscriptionAccepted,
  notifyActivityReminder,
  notifyCertificateReady
};