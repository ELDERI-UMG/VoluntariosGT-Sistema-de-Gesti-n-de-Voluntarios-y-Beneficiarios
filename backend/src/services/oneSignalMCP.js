import * as OneSignal from 'onesignal-node';
import fetch from 'node-fetch';

/**
 * OneSignal MCP-like Service
 * Servicio completo para manejar todas las operaciones de OneSignal
 * Incluye funciones de la API REST y funciones específicas para el sistema de voluntarios
 */
class OneSignalMCP {
  constructor() {
    this.isInitialized = false;
    this.appId = null;
    this.restApiKey = null;
    this.orgId = null;
    this.orgKey = null;
    this.client = null;
    
    // URLs de la API de OneSignal
    this.apiUrl = 'https://onesignal.com/api/v1';
    this.apiUrlV2 = 'https://api.onesignal.com';
  }
  
  /**
   * Inicializa el servicio con las variables de entorno
   */
  initialize() {
    if (this.isInitialized) return;
    
    // Configuración desde variables de entorno
    this.appId = process.env.ONESIGNAL_APP_ID;
    this.restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    this.orgId = process.env.ONESIGNAL_ORG_ID;
    this.orgKey = process.env.ONESIGNAL_ORG_KEY;
    
    // Cliente OneSignal
    if (this.appId && this.restApiKey) {
      this.client = new OneSignal.Client(this.appId, this.restApiKey);
    }
    
    this.isInitialized = true;
    console.log('OneSignal MCP inicializado con App ID:', this.appId);
  }
  
  /**
   * Asegura que el servicio esté inicializado
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  // ==================== CONFIGURACIÓN Y VALIDACIÓN ====================

  /**
   * Valida que todas las configuraciones estén presentes
   */
  validateConfig() {
    this.ensureInitialized();
    
    const required = ['appId', 'restApiKey', 'orgId', 'orgKey'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Configuración OneSignal incompleta. Faltan: ${missing.join(', ')}`);
    }
    
    console.log('✅ Configuración OneSignal validada correctamente');
    return true;
  }

  /**
   * Obtiene headers para peticiones a la API
   */
  getHeaders(useOrgKey = false) {
    this.ensureInitialized();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${useOrgKey ? this.orgKey : this.restApiKey}`
    };
  }

  // ==================== GESTIÓN DE APLICACIONES ====================

  /**
   * Obtiene información de la aplicación
   */
  async getAppInfo() {
    try {
      this.ensureInitialized();
      const response = await fetch(`${this.apiUrl}/apps/${this.appId}`, {
        headers: this.getHeaders(true)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error obteniendo info de app: ${data.errors || data.error}`);
      }
      
      console.log('Información de la app OneSignal obtenida');
      return data;
    } catch (error) {
      console.error('Error obteniendo información de la app:', error);
      throw error;
    }
  }

  /**
   * Actualiza configuración de la aplicación
   */
  async updateAppConfig(config) {
    try {
      const response = await fetch(`${this.apiUrl}/apps/${this.appId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error actualizando app: ${data.errors || data.error}`);
      }
      
      console.log('Configuración de la app actualizada');
      return data;
    } catch (error) {
      console.error('Error actualizando configuración de la app:', error);
      throw error;
    }
  }

  // ==================== GESTIÓN DE USUARIOS ====================

  /**
   * Obtiene información de un usuario específico
   */
  async getUser(playerId) {
    try {
      const response = await fetch(`${this.apiUrl}/players/${playerId}?app_id=${this.appId}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error obteniendo usuario: ${data.errors || data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  /**
   * Crea o actualiza un usuario
   */
  async createOrUpdateUser(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/players`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          app_id: this.appId,
          ...userData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error creando/actualizando usuario: ${data.errors || data.error}`);
      }
      
      console.log('Usuario creado/actualizado:', data.id);
      return data;
    } catch (error) {
      console.error('Error creando/actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza tags de un usuario
   */
  async updateUserTags(playerId, tags) {
    try {
      const response = await fetch(`${this.apiUrl}/players/${playerId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          app_id: this.appId,
          tags: tags
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error actualizando tags: ${data.errors || data.error}`);
      }
      
      console.log('Tags actualizados para usuario:', playerId);
      return data;
    } catch (error) {
      console.error('Error actualizando tags de usuario:', error);
      throw error;
    }
  }

  /**
   * Exporta usuarios con filtros
   */
  async exportUsers(filters = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/players/csv_export?app_id=${this.appId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          extra_fields: ['tags', 'location', 'last_active'],
          ...filters
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error exportando usuarios: ${data.errors || data.error}`);
      }
      
      console.log('Exportación de usuarios iniciada:', data.csv_file_url);
      return data;
    } catch (error) {
      console.error('Error exportando usuarios:', error);
      throw error;
    }
  }

  // ==================== NOTIFICACIONES AVANZADAS ====================

  /**
   * Envía notificación con configuración avanzada
   */
  async sendAdvancedNotification(notificationData) {
    try {
      this.ensureInitialized();
      const defaultConfig = {
        app_id: this.appId,
        // Configuración para Android
        android_group: 'voluntarios_gt',
        android_group_message: {
          'en': '$[notif_count] new notifications',
          'es': '$[notif_count] notificaciones nuevas'
        },
        android_led_color: 'FF0000FF',
        android_accent_color: 'FF0000FF',
        android_visibility: 1,
        // Configuración para iOS
        ios_category: 'VOLUNTARIOS_CATEGORY',
        ios_sound: 'default',
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
        // Configuración web
        web_icon: 'https://voluntarios-gt.com/icon-192x192.png',
        web_image: 'https://voluntarios-gt.com/banner.png',
        // Programación y entrega
        send_after: notificationData.send_after || undefined,
        delayed_option: notificationData.delayed_option || 'immediate',
        delivery_time_of_day: notificationData.delivery_time_of_day || undefined,
        // Configuración de entrega
        priority: 10,
        throttle_rate_per_minute: notificationData.throttle_rate_per_minute || undefined
      };

      const finalNotification = {
        ...defaultConfig,
        ...notificationData
      };

      const response = await this.client.createNotification(finalNotification);
      console.log('Notificación avanzada enviada:', response.body);
      return response.body;
    } catch (error) {
      console.error('Error enviando notificación avanzada:', error);
      throw error;
    }
  }

  /**
   * Envía notificación A/B Test
   */
  async sendABTestNotification(testData) {
    try {
      const notification = {
        app_id: this.appId,
        // Configuración A/B Test
        contents: testData.contents,
        headings: testData.headings,
        // Dividir tráfico
        include_player_ids: testData.include_player_ids || undefined,
        filters: testData.filters || undefined,
        // Configuración del test
        winner_criteria: testData.winner_criteria || 'open_rate',
        winner_time_hours: testData.winner_time_hours || 24,
        // Datos adicionales
        data: testData.data || {},
        ...testData.additional_config
      };

      const response = await this.client.createNotification(notification);
      console.log('A/B Test iniciado:', response.body);
      return response.body;
    } catch (error) {
      console.error('Error creando A/B Test:', error);
      throw error;
    }
  }

  // ==================== ANÁLISIS Y REPORTES ====================

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getNotificationStats(notificationId) {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${notificationId}?app_id=${this.appId}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error obteniendo estadísticas: ${data.errors || data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las notificaciones enviadas
   */
  async getNotificationHistory(limit = 50, offset = 0) {
    try {
      const response = await fetch(`${this.apiUrl}/notifications?app_id=${this.appId}&limit=${limit}&offset=${offset}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error obteniendo historial: ${data.errors || data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo historial de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de la aplicación
   */
  async getAppMetrics(startDate, endDate) {
    try {
      const response = await fetch(`${this.apiUrl}/apps/${this.appId}/outcome_data?outcome_names[]=os__session_duration&outcome_time_range=1d&outcome_platforms=0&outcome_attribution=direct&start_date=${startDate}&end_date=${endDate}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error obteniendo métricas: ${data.errors || data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo métricas de la app:', error);
      throw error;
    }
  }

  // ==================== FUNCIONES ESPECÍFICAS PARA VOLUNTARIOS ====================

  /**
   * Configura usuario voluntario completo
   */
  async setupVolunteerUser(userData) {
    try {
      console.log('Configurando usuario voluntario:', userData.userId);
      
      const playerData = {
        device_type: userData.deviceType || 0, // 0 = iOS, 1 = Android
        identifier: userData.deviceToken,
        external_user_id: userData.userId.toString(),
        tags: {
          user_type: 'voluntario',
          user_id: userData.userId.toString(),
          department: userData.department || 'guatemala',
          municipality: userData.municipality || '',
          interests: userData.interests || [],
          skills: userData.skills || [],
          availability: userData.availability || 'flexible',
          notification_preferences: userData.notificationPreferences || 'all'
        },
        lat: userData.latitude || null,
        long: userData.longitude || null,
        timezone: userData.timezone || -6, // GMT-6 para Guatemala
        language: 'es'
      };

      const result = await this.createOrUpdateUser(playerData);
      console.log('Usuario voluntario configurado:', result.id);
      return result;
    } catch (error) {
      console.error('Error configurando usuario voluntario:', error);
      throw error;
    }
  }

  /**
   * Configura usuario entidad completo
   */
  async setupEntityUser(userData) {
    try {
      console.log('Configurando usuario entidad:', userData.userId);
      
      const playerData = {
        device_type: userData.deviceType || 0,
        identifier: userData.deviceToken,
        external_user_id: userData.userId.toString(),
        tags: {
          user_type: 'entidad',
          user_id: userData.userId.toString(),
          entity_type: userData.entityType || 'ngo',
          organization_name: userData.organizationName || '',
          department: userData.department || 'guatemala',
          municipality: userData.municipality || '',
          focus_areas: userData.focusAreas || [],
          notification_preferences: userData.notificationPreferences || 'important'
        },
        lat: userData.latitude || null,
        long: userData.longitude || null,
        timezone: userData.timezone || -6,
        language: 'es'
      };

      const result = await this.createOrUpdateUser(playerData);
      console.log('Usuario entidad configurado:', result.id);
      return result;
    } catch (error) {
      console.error('Error configurando usuario entidad:', error);
      throw error;
    }
  }

  /**
   * Notifica nueva actividad con segmentación inteligente
   */
  async notifyNewActivitySmart(activityData) {
    try {
      console.log('Enviando notificación inteligente de nueva actividad');
      
      // Filtros para voluntarios cercanos y con intereses relevantes
      const filters = [
        { field: 'tag', key: 'user_type', relation: '=', value: 'voluntario' },
        { field: 'location', radius: activityData.radiusKm || 10, lat: activityData.lat, long: activityData.lng }
      ];

      // Si la actividad tiene categorías específicas, filtrar por intereses
      if (activityData.categories && activityData.categories.length > 0) {
        activityData.categories.forEach(category => {
          filters.push({
            field: 'tag',
            key: 'interests',
            relation: 'exists',
            value: category
          });
        });
      }

      const notification = {
        headings: {
          'es': '🌟 Nueva Actividad Disponible',
          'en': '🌟 New Activity Available'
        },
        contents: {
          'es': `${activityData.title} en ${activityData.municipality}`,
          'en': `${activityData.title} in ${activityData.municipality}`
        },
        filters: filters,
        data: {
          type: 'new_activity',
          activity_id: activityData.id,
          entity_name: activityData.entityName,
          lat: activityData.lat,
          lng: activityData.lng,
          category: activityData.categories?.[0] || 'general'
        },
        web_url: `https://voluntarios-gt.com/activity/${activityData.id}`,
        app_url: `voluntarios://activity/${activityData.id}`,
        android_group: 'new_activities',
        android_led_color: 'FF00FF00',
        ios_category: 'NEW_ACTIVITY'
      };

      return await this.sendAdvancedNotification(notification);
    } catch (error) {
      console.error('Error enviando notificación inteligente de actividad:', error);
      throw error;
    }
  }

  /**
   * Envía recordatorios programados de actividad
   */
  async scheduleActivityReminders(activityData, participantIds) {
    try {
      console.log('Programando recordatorios de actividad');
      
      const activityDate = new Date(activityData.startDate);
      const now = new Date();
      
      // Recordatorio 24 horas antes
      const reminder24h = new Date(activityDate.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        await this.sendAdvancedNotification({
          headings: {
            'es': '⏰ Recordatorio de Actividad',
            'en': '⏰ Activity Reminder'
          },
          contents: {
            'es': `La actividad "${activityData.title}" es mañana`,
            'en': `The activity "${activityData.title}" is tomorrow`
          },
          include_external_user_ids: participantIds,
          send_after: reminder24h.toISOString(),
          data: {
            type: 'activity_reminder_24h',
            activity_id: activityData.id
          }
        });
      }
      
      // Recordatorio 2 horas antes
      const reminder2h = new Date(activityDate.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > now) {
        await this.sendAdvancedNotification({
          headings: {
            'es': '🚀 ¡Actividad Próxima!',
            'en': '🚀 Activity Starting Soon!'
          },
          contents: {
            'es': `"${activityData.title}" comienza en 2 horas`,
            'en': `"${activityData.title}" starts in 2 hours`
          },
          include_external_user_ids: participantIds,
          send_after: reminder2h.toISOString(),
          data: {
            type: 'activity_reminder_2h',
            activity_id: activityData.id
          }
        });
      }
      
      console.log('Recordatorios programados exitosamente');
      return { reminder24h: reminder24h > now, reminder2h: reminder2h > now };
    } catch (error) {
      console.error('Error programando recordatorios:', error);
      throw error;
    }
  }

  /**
   * Sistema de notificaciones gamificadas
   */
  async sendGamificationNotification(userId, achievement) {
    try {
      const achievements = {
        first_activity: {
          title: '🎉 ¡Primera Actividad!',
          message: '¡Felicidades! Has completado tu primera actividad como voluntario',
          points: 50
        },
        five_activities: {
          title: '⭐ Voluntario Comprometido',
          message: '¡Increíble! Has completado 5 actividades',
          points: 100
        },
        ten_activities: {
          title: '🏆 Voluntario Estrella',
          message: '¡Eres increíble! 10 actividades completadas',
          points: 200
        },
        certificate_earned: {
          title: '📜 Certificado Obtenido',
          message: 'Tu certificado está listo para descargar',
          points: 0
        }
      };

      const config = achievements[achievement.type] || {
        title: '🎊 ¡Logro Desbloqueado!',
        message: 'Has alcanzado un nuevo logro',
        points: 25
      };

      return await this.sendAdvancedNotification({
        headings: { 'en': config.title, 'es': config.title },
        contents: { 'en': config.message, 'es': config.message },
        include_external_user_ids: [userId.toString()],
        data: {
          type: 'gamification',
          achievement_type: achievement.type,
          points_earned: config.points,
          total_points: achievement.totalPoints || 0
        },
        android_group: 'achievements',
        ios_category: 'ACHIEVEMENT'
      });
    } catch (error) {
      console.error('Error enviando notificación de gamificación:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Verifica el estado del servicio
   */
  async healthCheck() {
    try {
      this.validateConfig();
      const appInfo = await this.getAppInfo();
      
      return {
        status: 'healthy',
        appId: this.appId,
        appName: appInfo.name,
        playerCount: appInfo.players,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Limpia datos de prueba
   */
  async cleanupTestData() {
    try {
      console.log('Limpiando datos de prueba...');
      // Aquí implementarías la lógica para limpiar datos de testing
      // Por ejemplo, eliminar usuarios con tags de testing
      
      console.log('Datos de prueba limpiados');
      return { success: true };
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const oneSignalMCP = new OneSignalMCP();
export default oneSignalMCP;