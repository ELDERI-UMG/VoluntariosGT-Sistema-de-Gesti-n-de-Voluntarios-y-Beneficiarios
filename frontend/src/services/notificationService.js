import { OneSignal } from 'react-native-onesignal';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.pushToken = null;
  }

  /**
   * Inicializa OneSignal
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Inicializar OneSignal
      OneSignal.initialize(APP_CONFIG.ONESIGNAL.APP_ID);
      
      // Solicitar permisos de notificación
      const hasPermission = await this.requestPermissions();
      console.log('Permisos de notificación:', hasPermission);

      // Configurar listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('OneSignal inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando OneSignal:', error);
    }
  }

  /**
   * Solicita permisos de notificación
   */
  async requestPermissions() {
    try {
      const permission = await OneSignal.Notifications.requestPermission(true);
      return permission;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Configura los listeners de OneSignal
   */
  setupListeners() {
    // Listener para cuando se recibe una notificación
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('Notificación clickeada:', event);
      this.handleNotificationClicked(event);
    });

    // Listener para cuando se recibe una notificación en primer plano
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('Notificación recibida en primer plano:', event);
      // La notificación se mostrará automáticamente
      event.getNotification().display();
    });

    // Listener para cambios en el estado de suscripción
    OneSignal.User.pushSubscription.addEventListener('change', (event) => {
      console.log('Cambio en suscripción push:', event);
      if (event.current.token) {
        this.pushToken = event.current.token;
        this.savePushToken(event.current.token);
      }
    });
  }

  /**
   * Maneja cuando se hace clic en una notificación
   */
  handleNotificationClicked(event) {
    const notification = event.notification;
    const data = notification.additionalData || {};

    console.log('Datos de la notificación:', data);

    // Manejar diferentes tipos de notificaciones
    switch (data.type) {
      case 'new_activity':
        this.handleNewActivityNotification(data);
        break;
      case 'inscription_accepted':
        this.handleInscriptionAcceptedNotification(data);
        break;
      case 'activity_reminder':
        this.handleActivityReminderNotification(data);
        break;
      case 'certificate_ready':
        this.handleCertificateReadyNotification(data);
        break;
      default:
        console.log('Tipo de notificación desconocido:', data.type);
    }
  }

  /**
   * Maneja notificación de nueva actividad
   */
  handleNewActivityNotification(data) {
    if (data.activity_id) {
      // Navegar a la pantalla de detalles de actividad
      // Esto se debe implementar con el sistema de navegación
      console.log('Navegando a actividad:', data.activity_id);
    }
  }

  /**
   * Maneja notificación de inscripción aceptada
   */
  handleInscriptionAcceptedNotification(data) {
    if (data.activity_id) {
      console.log('Inscripción aceptada para actividad:', data.activity_id);
    }
  }

  /**
   * Maneja notificación de recordatorio de actividad
   */
  handleActivityReminderNotification(data) {
    if (data.activity_id) {
      console.log('Recordatorio de actividad:', data.activity_id);
    }
  }

  /**
   * Maneja notificación de certificado listo
   */
  handleCertificateReadyNotification(data) {
    if (data.certificate_id) {
      console.log('Certificado listo:', data.certificate_id);
    }
  }

  /**
   * Establece el ID del usuario para las notificaciones
   */
  async setUserId(userId, userType = 'voluntario') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Establecer external user ID
      OneSignal.login(userId.toString());
      
      // Establecer tags para segmentación
      OneSignal.User.addTags({
        user_id: userId.toString(),
        user_type: userType,
        app_version: APP_CONFIG.version,
        platform: Platform.OS
      });

      this.userId = userId;
      await AsyncStorage.setItem('notification_user_id', userId.toString());
      
      console.log('Usuario configurado para notificaciones:', userId);
    } catch (error) {
      console.error('Error configurando usuario:', error);
    }
  }

  /**
   * Actualiza las etiquetas del usuario
   */
  async updateUserTags(tags) {
    try {
      if (!this.isInitialized) return;

      OneSignal.User.addTags(tags);
      console.log('Tags actualizadas:', tags);
    } catch (error) {
      console.error('Error actualizando tags:', error);
    }
  }

  /**
   * Establece la ubicación del usuario para notificaciones geolocalizadas
   */
  async setUserLocation(latitude, longitude) {
    try {
      if (!this.isInitialized) return;

      OneSignal.Location.setShared([latitude, longitude]);
      console.log('Ubicación configurada:', latitude, longitude);
    } catch (error) {
      console.error('Error configurando ubicación:', error);
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    try {
      if (!this.isInitialized) return;

      OneSignal.logout();
      this.userId = null;
      await AsyncStorage.removeItem('notification_user_id');
      
      console.log('Usuario deslogueado de notificaciones');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  }

  /**
   * Obtiene el estado de la suscripción push
   */
  async getSubscriptionState() {
    try {
      if (!this.isInitialized) return null;

      const state = OneSignal.User.pushSubscription.optedIn;
      return state;
    } catch (error) {
      console.error('Error obteniendo estado de suscripción:', error);
      return null;
    }
  }

  /**
   * Habilita o deshabilita las notificaciones push
   */
  async setNotificationsEnabled(enabled) {
    try {
      if (!this.isInitialized) return;

      OneSignal.User.pushSubscription.optIn();
      console.log('Notificaciones:', enabled ? 'habilitadas' : 'deshabilitadas');
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
    }
  }

  /**
   * Guarda el token push en AsyncStorage
   */
  async savePushToken(token) {
    try {
      await AsyncStorage.setItem('push_token', token);
      console.log('Token push guardado');
    } catch (error) {
      console.error('Error guardando token push:', error);
    }
  }

  /**
   * Obtiene el token push guardado
   */
  async getPushToken() {
    try {
      const token = await AsyncStorage.getItem('push_token');
      return token;
    } catch (error) {
      console.error('Error obteniendo token push:', error);
      return null;
    }
  }

  /**
   * Muestra una notificación local (para testing)
   */
  showLocalNotification(title, message) {
    Alert.alert(title, message);
  }

  /**
   * Obtiene el ID del dispositivo OneSignal
   */
  async getOneSignalId() {
    try {
      if (!this.isInitialized) return null;

      const deviceState = await OneSignal.getDeviceState();
      return deviceState?.userId || null;
    } catch (error) {
      console.error('Error obteniendo OneSignal ID:', error);
      return null;
    }
  }

  /**
   * Verifica si las notificaciones están habilitadas
   */
  async areNotificationsEnabled() {
    try {
      if (!this.isInitialized) return false;

      const permissionStatus = await OneSignal.getDeviceState();
      return permissionStatus?.hasNotificationPermission || false;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();
export default notificationService;