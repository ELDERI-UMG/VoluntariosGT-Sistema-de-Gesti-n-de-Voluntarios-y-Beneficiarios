import { OneSignal } from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { APP_CONFIG } from '../constants/config';

/**
 * Servicio especializado para manejar suscripciones de OneSignal
 * Asegura que todos los usuarios se registren correctamente
 */
class OneSignalSubscriptionService {
  constructor() {
    this.isInitialized = false;
    this.subscriptionAttempts = 0;
    this.maxAttempts = 3;
  }

  /**
   * Inicializa la suscripción completa
   */
  async initializeSubscription() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Iniciando proceso de suscripción OneSignal...');
      
      // Paso 1: Verificar que OneSignal esté inicializado
      await this.ensureOneSignalReady();
      
      // Paso 2: Solicitar permisos
      const hasPermissions = await this.requestNotificationPermissions();
      
      if (!hasPermissions) {
        console.warn('⚠️ Permisos de notificación no otorgados');
        return false;
      }
      
      // Paso 3: Configurar usuario automáticamente
      await this.autoConfigureUser();
      
      // Paso 4: Verificar suscripción
      const isSubscribed = await this.verifySubscription();
      
      if (isSubscribed) {
        console.log('✅ Usuario suscrito exitosamente a OneSignal');
        this.isInitialized = true;
        return true;
      } else {
        console.warn('❌ No se pudo completar la suscripción');
        return false;
      }
      
    } catch (error) {
      console.error('Error en inicialización de suscripción:', error);
      return false;
    }
  }

  /**
   * Asegura que OneSignal esté listo
   */
  async ensureOneSignalReady() {
    console.log('🔍 Verificando estado de OneSignal...');
    
    // Verificar que OneSignal esté inicializado
    try {
      const deviceState = await OneSignal.getDeviceState();
      console.log('📱 Estado del dispositivo OneSignal:', {
        hasNotificationPermission: deviceState?.hasNotificationPermission,
        isSubscribed: deviceState?.isSubscribed,
        userId: deviceState?.userId?.substring(0, 8) + '...'
      });
      
      return true;
    } catch (error) {
      console.error('Error obteniendo estado del dispositivo:', error);
      throw error;
    }
  }

  /**
   * Solicita permisos de notificación de forma agresiva
   */
  async requestNotificationPermissions() {
    console.log('📋 Solicitando permisos de notificación...');
    
    try {
      // Para Android, solicitar permiso POST_NOTIFICATIONS
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const { PermissionsAndroid } = require('react-native');
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Permisos de Notificación',
            message: 'VoluntariosGT necesita enviar notificaciones sobre nuevas actividades y actualizaciones importantes.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        
        console.log('Android permission result:', permission);
        
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permisos Necesarios',
            'Las notificaciones son importantes para mantenerte informado sobre nuevas oportunidades de voluntariado.',
            [{ text: 'Entendido' }]
          );
        }
      }
      
      // Solicitar autorización de OneSignal
      const authStatus = await OneSignal.Notifications.requestPermission(true);
      
      console.log('📋 Estado de autorización OneSignal:', authStatus);
      
      const isAuthorized = 
        authStatus === OneSignal.OSNotificationPermission.Authorized ||
        authStatus === OneSignal.OSNotificationPermission.Provisional ||
        authStatus === true; // Para compatibilidad
      
      if (isAuthorized) {
        console.log('✅ Permisos de notificación otorgados');
        return true;
      } else {
        console.warn('❌ Permisos de notificación denegados');
        return false;
      }
      
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Configura automáticamente el usuario
   */
  async autoConfigureUser() {
    console.log('👤 Configurando usuario automáticamente...');
    
    try {
      // Obtener datos del usuario guardados
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('👤 Usuario encontrado:', userData.email);
        
        // Configurar external user ID
        OneSignal.login(userData.id.toString());
        
        // Configurar tags básicos
        const tags = {
          user_id: userData.id.toString(),
          user_type: userData.tipo_usuario || 'voluntario',
          email: userData.email,
          platform: Platform.OS,
          app_version: APP_CONFIG.version,
          registration_date: new Date().toISOString(),
          last_active: new Date().toISOString()
        };
        
        // Agregar tags específicos según el tipo de usuario
        if (userData.tipo_usuario === 'voluntario') {
          tags.volunteer_status = 'active';
          tags.interests = userData.intereses || [];
        } else if (userData.tipo_usuario === 'entidad') {
          tags.entity_type = userData.tipo_organizacion || 'ngo';
          tags.organization_name = userData.nombre_organizacion || '';
        }
        
        OneSignal.User.addTags(tags);
        
        console.log('🏷️ Tags configurados:', Object.keys(tags));
      } else {
        console.log('👤 No hay usuario logueado, configurando usuario anónimo...');
        
        // Configurar usuario anónimo temporal
        const anonymousId = `anonymous_${Date.now()}`;
        OneSignal.login(anonymousId);
        
        OneSignal.User.addTags({
          user_type: 'anonymous',
          platform: Platform.OS,
          app_version: APP_CONFIG.version,
          registration_date: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error configurando usuario:', error);
      return false;
    }
  }

  /**
   * Verifica que la suscripción sea exitosa
   */
  async verifySubscription() {
    console.log('✅ Verificando suscripción...');
    
    try {
      // Esperar un poco para que se procese la suscripción
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const deviceState = await OneSignal.getDeviceState();
      
      if (deviceState) {
        console.log('📊 Estado final del dispositivo:', {
          isSubscribed: deviceState.isSubscribed,
          hasNotificationPermission: deviceState.hasNotificationPermission,
          userId: deviceState.userId?.substring(0, 8) + '...',
          pushToken: deviceState.pushToken ? 'Sí' : 'No'
        });
        
        // Guardar información de suscripción
        await AsyncStorage.setItem('oneSignal_subscription', JSON.stringify({
          isSubscribed: deviceState.isSubscribed,
          userId: deviceState.userId,
          subscriptionDate: new Date().toISOString()
        }));
        
        return deviceState.isSubscribed && deviceState.hasNotificationPermission;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }

  /**
   * Reintenta la suscripción si falla
   */
  async retrySubscription() {
    if (this.subscriptionAttempts >= this.maxAttempts) {
      console.warn('❌ Máximo número de intentos de suscripción alcanzado');
      return false;
    }
    
    this.subscriptionAttempts++;
    console.log(`🔄 Reintentando suscripción (intento ${this.subscriptionAttempts}/${this.maxAttempts})...`);
    
    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.isInitialized = false;
    return await this.initializeSubscription();
  }

  /**
   * Obtiene el ID de OneSignal del usuario
   */
  async getOneSignalUserId() {
    try {
      const deviceState = await OneSignal.getDeviceState();
      return deviceState?.userId || null;
    } catch (error) {
      console.error('Error obteniendo OneSignal User ID:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está suscrito
   */
  async isUserSubscribed() {
    try {
      const deviceState = await OneSignal.getDeviceState();
      return deviceState?.isSubscribed || false;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }

  /**
   * Fuerza la suscripción del usuario
   */
  async forceSubscription() {
    console.log('🔨 Forzando suscripción...');
    
    try {
      // Opt-in explícitamente
      OneSignal.User.pushSubscription.optIn();
      
      // Configurar preferencias de notificación
      await AsyncStorage.setItem('notification_preferences', JSON.stringify({
        enabled: true,
        types: ['new_activities', 'reminders', 'updates'],
        updatedAt: new Date().toISOString()
      }));
      
      console.log('✅ Suscripción forzada completada');
      return true;
    } catch (error) {
      console.error('Error forzando suscripción:', error);
      return false;
    }
  }

  /**
   * Diagnostica problemas de suscripción
   */
  async diagnoseSubscriptionIssues() {
    console.log('🔍 Diagnosticando problemas de suscripción...');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      platformVersion: Platform.Version,
      appId: APP_CONFIG.ONESIGNAL.APP_ID,
      issues: [],
      recommendations: []
    };
    
    try {
      // Verificar estado del dispositivo
      const deviceState = await OneSignal.getDeviceState();
      
      if (!deviceState) {
        diagnosis.issues.push('No se puede obtener estado del dispositivo');
        diagnosis.recommendations.push('Verificar inicialización de OneSignal');
      } else {
        diagnosis.deviceState = {
          isSubscribed: deviceState.isSubscribed,
          hasNotificationPermission: deviceState.hasNotificationPermission,
          userId: deviceState.userId ? 'Presente' : 'Ausente',
          pushToken: deviceState.pushToken ? 'Presente' : 'Ausente'
        };
        
        if (!deviceState.hasNotificationPermission) {
          diagnosis.issues.push('Sin permisos de notificación');
          diagnosis.recommendations.push('Solicitar permisos de notificación nuevamente');
        }
        
        if (!deviceState.isSubscribed) {
          diagnosis.issues.push('Usuario no suscrito');
          diagnosis.recommendations.push('Llamar OneSignal.User.pushSubscription.optIn()');
        }
        
        if (!deviceState.userId) {
          diagnosis.issues.push('Sin User ID de OneSignal');
          diagnosis.recommendations.push('Verificar conexión a internet y configuración del App ID');
        }
      }
      
      console.log('📋 Diagnóstico completo:', diagnosis);
      return diagnosis;
      
    } catch (error) {
      diagnosis.issues.push(`Error en diagnóstico: ${error.message}`);
      console.error('Error en diagnóstico:', error);
      return diagnosis;
    }
  }
}

// Exportar instancia singleton
export const oneSignalSubscription = new OneSignalSubscriptionService();
export default oneSignalSubscription;