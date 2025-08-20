import express from 'express';
import { oneSignalMCP } from '../services/oneSignalMCP.js';
import { authenticateUser as authMiddleware } from '../utils/middleware.js';

const router = express.Router();

/**
 * Rutas para testing y administración de OneSignal
 */

// Health check del servicio OneSignal
router.get('/health', async (req, res) => {
  try {
    const health = await oneSignalMCP.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: 'Error verificando estado de OneSignal',
      details: error.message
    });
  }
});

// Obtener información de la aplicación
router.get('/app-info', authMiddleware, async (req, res) => {
  try {
    const appInfo = await oneSignalMCP.getAppInfo();
    res.json(appInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo información de la app',
      details: error.message
    });
  }
});

// Obtener estadísticas de notificaciones
router.get('/stats/:notificationId', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const stats = await oneSignalMCP.getNotificationStats(notificationId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      details: error.message
    });
  }
});

// Obtener historial de notificaciones
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const history = await oneSignalMCP.getNotificationHistory(parseInt(limit), parseInt(offset));
    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo historial',
      details: error.message
    });
  }
});

// Configurar usuario voluntario
router.post('/setup-volunteer', authMiddleware, async (req, res) => {
  try {
    const userData = req.body;
    const result = await oneSignalMCP.setupVolunteerUser(userData);
    res.json({
      message: 'Usuario voluntario configurado correctamente',
      oneSignalId: result.id,
      success: result.success
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error configurando usuario voluntario',
      details: error.message
    });
  }
});

// Configurar usuario entidad
router.post('/setup-entity', authMiddleware, async (req, res) => {
  try {
    const userData = req.body;
    const result = await oneSignalMCP.setupEntityUser(userData);
    res.json({
      message: 'Usuario entidad configurado correctamente',
      oneSignalId: result.id,
      success: result.success
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error configurando usuario entidad',
      details: error.message
    });
  }
});

// Enviar notificación de prueba
router.post('/test-notification', authMiddleware, async (req, res) => {
  try {
    const { userIds, title, message, data } = req.body;
    
    if (!userIds || !title || !message) {
      return res.status(400).json({
        error: 'userIds, title y message son requeridos'
      });
    }

    const notification = {
      contents: { en: message, es: message },
      headings: { en: title, es: title },
      include_external_user_ids: userIds,
      data: data || { test: true, timestamp: Date.now() }
    };

    const result = await oneSignalMCP.sendAdvancedNotification(notification);
    
    res.json({
      message: 'Notificación de prueba enviada',
      notificationId: result.id,
      recipients: result.recipients
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error enviando notificación de prueba',
      details: error.message
    });
  }
});

// Enviar notificación inteligente de actividad
router.post('/notify-activity', authMiddleware, async (req, res) => {
  try {
    const activityData = req.body;
    
    const requiredFields = ['id', 'title', 'entityName', 'lat', 'lng'];
    const missingFields = requiredFields.filter(field => !activityData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }

    const result = await oneSignalMCP.notifyNewActivitySmart(activityData);
    
    res.json({
      message: 'Notificación de actividad enviada',
      notificationId: result.id,
      recipients: result.recipients
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error enviando notificación de actividad',
      details: error.message
    });
  }
});

// Programar recordatorios de actividad
router.post('/schedule-reminders', authMiddleware, async (req, res) => {
  try {
    const { activityData, participantIds } = req.body;
    
    if (!activityData || !participantIds) {
      return res.status(400).json({
        error: 'activityData y participantIds son requeridos'
      });
    }

    const result = await oneSignalMCP.scheduleActivityReminders(activityData, participantIds);
    
    res.json({
      message: 'Recordatorios programados',
      scheduled: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error programando recordatorios',
      details: error.message
    });
  }
});

// Enviar notificación de gamificación
router.post('/gamification', authMiddleware, async (req, res) => {
  try {
    const { userId, achievement } = req.body;
    
    if (!userId || !achievement) {
      return res.status(400).json({
        error: 'userId y achievement son requeridos'
      });
    }

    const result = await oneSignalMCP.sendGamificationNotification(userId, achievement);
    
    res.json({
      message: 'Notificación de gamificación enviada',
      notificationId: result.id
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error enviando notificación de gamificación',
      details: error.message
    });
  }
});

// Obtener información de usuario OneSignal
router.get('/user/:playerId', authMiddleware, async (req, res) => {
  try {
    const { playerId } = req.params;
    const userInfo = await oneSignalMCP.getUser(playerId);
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo información del usuario',
      details: error.message
    });
  }
});

// Actualizar tags de usuario
router.put('/user/:playerId/tags', authMiddleware, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { tags } = req.body;
    
    if (!tags) {
      return res.status(400).json({
        error: 'tags son requeridos'
      });
    }

    const result = await oneSignalMCP.updateUserTags(playerId, tags);
    
    res.json({
      message: 'Tags actualizados correctamente',
      success: result.success
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error actualizando tags',
      details: error.message
    });
  }
});

// Exportar usuarios
router.post('/export-users', authMiddleware, async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const result = await oneSignalMCP.exportUsers(filters);
    
    res.json({
      message: 'Exportación iniciada',
      csvUrl: result.csv_file_url
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error exportando usuarios',
      details: error.message
    });
  }
});

// Limpiar datos de prueba
router.delete('/cleanup-test-data', authMiddleware, async (req, res) => {
  try {
    const result = await oneSignalMCP.cleanupTestData();
    res.json({
      message: 'Datos de prueba limpiados',
      result: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error limpiando datos de prueba',
      details: error.message
    });
  }
});

// Verificar usuario suscrito
router.get('/verify-subscription/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const userInfo = await oneSignalMCP.getUser(playerId);
    
    res.json({
      playerId: playerId,
      isValid: !!userInfo,
      isSubscribed: userInfo?.invalid_identifier === false,
      lastActive: userInfo?.last_active,
      createdAt: userInfo?.created_at,
      platform: userInfo?.device_type,
      tags: userInfo?.tags || {}
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error verificando suscripción',
      details: error.message
    });
  }
});

// Obtener estadísticas de suscripciones
router.get('/subscription-stats', authMiddleware, async (req, res) => {
  try {
    const appInfo = await oneSignalMCP.getAppInfo();
    
    res.json({
      totalPlayers: appInfo.players,
      messageablePlayers: appInfo.messageable_players,
      lastUpdated: new Date().toISOString(),
      platforms: {
        ios: appInfo.ios_count || 0,
        android: appInfo.android_count || 0,
        web: appInfo.web_count || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      details: error.message
    });
  }
});

// Registrar nuevo usuario desde la app
router.post('/register-user', async (req, res) => {
  try {
    const { userId, userType, deviceToken, userInfo } = req.body;
    
    if (!userId || !userType) {
      return res.status(400).json({
        error: 'userId y userType son requeridos'
      });
    }

    let result;
    if (userType === 'voluntario') {
      result = await oneSignalMCP.setupVolunteerUser({
        userId,
        deviceType: userInfo.platform === 'android' ? 1 : 0,
        deviceToken,
        ...userInfo
      });
    } else if (userType === 'entidad') {
      result = await oneSignalMCP.setupEntityUser({
        userId,
        deviceType: userInfo.platform === 'android' ? 1 : 0,
        deviceToken,
        ...userInfo
      });
    } else {
      return res.status(400).json({
        error: 'Tipo de usuario no válido'
      });
    }
    
    res.json({
      message: 'Usuario registrado exitosamente en OneSignal',
      oneSignalId: result.id,
      success: result.success !== false
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error registrando usuario',
      details: error.message
    });
  }
});

export default router;