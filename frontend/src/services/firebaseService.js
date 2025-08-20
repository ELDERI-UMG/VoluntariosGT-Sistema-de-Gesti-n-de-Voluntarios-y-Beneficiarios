import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

/**
 * Servicio Firebase para React Native
 * Maneja Cloud Messaging y notificaciones push
 */
class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.onTokenRefreshListener = null;
    this.onMessageListener = null;
    this.onNotificationOpenedAppListener = null;
  }

  /**
   * Inicializa Firebase Messaging
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Inicializando Firebase Messaging...');

      // Verificar si el dispositivo soporta Firebase Messaging
      const enabled = await messaging().hasPermission();
      console.log('Permisos de Firebase Messaging:', enabled);

      if (enabled === messaging.AuthorizationStatus.NOT_DETERMINED) {
        await this.requestPermissions();
      }

      // Obtener token FCM
      await this.getFCMToken();

      // Configurar listeners
      this.setupListeners();

      // Manejar notificación que abrió la app (cuando estaba cerrada)
      await this.handleInitialNotification();

      this.isInitialized = true;
      console.log('Firebase Messaging inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando Firebase Messaging:', error);
      throw error;
    }
  }

  /**
   * Solicita permisos de notificación
   */
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        // Para Android 13+ necesitamos solicitar permiso específico
        if (Platform.Version >= 33) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          console.log('Permiso POST_NOTIFICATIONS:', permission);
        }
      }

      // Solicitar autorización de Firebase
      const authStatus = await messaging().requestPermission();
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Permisos de notificación otorgados:', authStatus);
      } else {
        console.log('Permisos de notificación denegados');
      }

      return enabled;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene el token FCM del dispositivo
   */
  async getFCMToken() {
    try {
      // Verificar si ya tenemos un token guardado
      const savedToken = await AsyncStorage.getItem('fcm_token');
      
      // Obtener nuevo token
      const token = await messaging().getToken();
      
      if (token) {
        this.fcmToken = token;
        
        // Guardar token si es diferente al guardado
        if (savedToken !== token) {
          await AsyncStorage.setItem('fcm_token', token);
          console.log('Nuevo token FCM obtenido y guardado');
          
          // Enviar token al backend
          await this.sendTokenToBackend(token);
        }
        
        console.log('Token FCM:', token.substring(0, 50) + '...');
        return token;
      } else {
        console.warn('No se pudo obtener token FCM');
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo token FCM:', error);
      return null;
    }
  }

  /**
   * Configura los listeners de Firebase Messaging
   */
  setupListeners() {
    // Listener para cuando se actualiza el token
    this.onTokenRefreshListener = messaging().onTokenRefresh(async (token) => {
      console.log('Token FCM actualizado:', token.substring(0, 50) + '...');
      this.fcmToken = token;
      await AsyncStorage.setItem('fcm_token', token);
      await this.sendTokenToBackend(token);
    });

    // Listener para mensajes en primer plano
    this.onMessageListener = messaging().onMessage(async (remoteMessage) => {
      console.log('Mensaje recibido en primer plano:', remoteMessage);
      
      // Mostrar notificación local si la app está en primer plano
      this.showLocalNotification(remoteMessage);
    });

    // Listener para cuando se toca una notificación y abre la app
    this.onNotificationOpenedAppListener = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notificación tocada, app abierta desde background:', remoteMessage);
      this.handleNotificationAction(remoteMessage);
    });

    // Listener para mensajes en background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Mensaje recibido en background:', remoteMessage);
      // Aquí puedes procesar el mensaje en background
    });
  }

  /**
   * Maneja la notificación inicial (cuando la app se abre desde una notificación)
   */
  async handleInitialNotification() {
    try {
      const initialNotification = await messaging().getInitialNotification();
      
      if (initialNotification) {
        console.log('App abierta desde notificación:', initialNotification);
        this.handleNotificationAction(initialNotification);
      }
    } catch (error) {
      console.error('Error manejando notificación inicial:', error);
    }
  }

  /**
   * Maneja las acciones cuando se toca una notificación
   */
  handleNotificationAction(remoteMessage) {
    const data = remoteMessage.data || {};
    
    console.log('Manejando acción de notificación:', data);

    // Manejar diferentes tipos de notificaciones
    switch (data.type) {
      case 'new_activity':
        this.navigateToActivity(data.activity_id);
        break;
      case 'inscription_accepted':
        this.navigateToMyActivities();
        break;
      case 'activity_reminder':
        this.navigateToActivity(data.activity_id);
        break;
      case 'certificate_ready':
        this.navigateToCertificates();
        break;
      default:
        console.log('Tipo de notificación no manejado:', data.type);
    }
  }

  /**
   * Muestra una notificación local cuando la app está en primer plano
   */
  showLocalNotification(remoteMessage) {
    const { notification } = remoteMessage;
    
    if (notification) {
      Alert.alert(
        notification.title || 'Notificación',
        notification.body || 'Nueva notificación recibida',
        [
          {
            text: 'Cerrar',
            style: 'cancel',
          },
          {
            text: 'Ver',
            onPress: () => this.handleNotificationAction(remoteMessage),
          },
        ]
      );
    }
  }

  /**
   * Envía el token FCM al backend
   */
  async sendTokenToBackend(token) {
    try {
      // Obtener información del usuario actual
      const userInfo = await AsyncStorage.getItem('user_data');
      
      if (userInfo) {
        const user = JSON.parse(userInfo);
        
        // Aquí harías la petición a tu backend
        // Por ahora solo guardamos localmente
        await AsyncStorage.setItem('user_fcm_info', JSON.stringify({
          userId: user.id,
          fcmToken: token,
          platform: Platform.OS,
          updatedAt: new Date().toISOString()
        }));
        
        console.log('Token FCM asociado al usuario:', user.id);
      }
    } catch (error) {
      console.error('Error enviando token al backend:', error);
    }
  }

  /**
   * Suscribe el dispositivo a un tema
   */
  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log('Suscrito al tema:', topic);
      
      // Guardar suscripción localmente
      const subscriptions = await this.getSubscriptions();
      subscriptions.push(topic);
      await AsyncStorage.setItem('fcm_subscriptions', JSON.stringify([...new Set(subscriptions)]));
    } catch (error) {
      console.error('Error suscribiéndose al tema:', topic, error);
    }
  }

  /**
   * Desuscribe el dispositivo de un tema
   */
  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log('Desuscrito del tema:', topic);
      
      // Actualizar suscripciones locales
      const subscriptions = await this.getSubscriptions();
      const updatedSubscriptions = subscriptions.filter(sub => sub !== topic);
      await AsyncStorage.setItem('fcm_subscriptions', JSON.stringify(updatedSubscriptions));
    } catch (error) {
      console.error('Error desuscribiéndose del tema:', topic, error);
    }
  }

  /**
   * Obtiene las suscripciones actuales
   */
  async getSubscriptions() {
    try {
      const subscriptions = await AsyncStorage.getItem('fcm_subscriptions');
      return subscriptions ? JSON.parse(subscriptions) : [];
    } catch (error) {
      console.error('Error obteniendo suscripciones:', error);
      return [];
    }
  }

  /**
   * Configura el usuario para notificaciones
   */
  async setupUser(userId, userType) {
    try {
      console.log('Configurando usuario Firebase:', userId, userType);
      
      // Suscribirse a temas según el tipo de usuario
      await this.subscribeToTopic(`user_type_${userType}`);
      await this.subscribeToTopic(`user_${userId}`);
      
      // Si es voluntario, suscribirse a notificaciones de actividades
      if (userType === 'voluntario') {
        await this.subscribeToTopic('new_activities');
        await this.subscribeToTopic('volunteer_announcements');
      }
      
      // Si es entidad, suscribirse a notificaciones administrativas
      if (userType === 'entidad') {
        await this.subscribeToTopic('entity_announcements');
      }
      
      // Enviar token actualizado al backend
      if (this.fcmToken) {
        await this.sendTokenToBackend(this.fcmToken);
      }
      
      console.log('Usuario Firebase configurado correctamente');
    } catch (error) {
      console.error('Error configurando usuario Firebase:', error);
    }
  }

  /**
   * Limpia la configuración del usuario
   */
  async logout() {
    try {
      console.log('Limpiando configuración Firebase del usuario');
      
      // Obtener suscripciones actuales y desuscribirse
      const subscriptions = await this.getSubscriptions();
      for (const topic of subscriptions) {
        await this.unsubscribeFromTopic(topic);
      }
      
      // Limpiar datos locales
      await AsyncStorage.removeItem('fcm_token');
      await AsyncStorage.removeItem('fcm_subscriptions');
      await AsyncStorage.removeItem('user_fcm_info');
      
      this.fcmToken = null;
      
      console.log('Configuración Firebase limpiada');
    } catch (error) {
      console.error('Error limpiando configuración Firebase:', error);
    }
  }

  /**
   * Funciones de navegación (deben ser implementadas con el router real)
   */
  navigateToActivity(activityId) {
    console.log('Navegando a actividad:', activityId);
    // Implementar navegación real aquí
  }

  navigateToMyActivities() {
    console.log('Navegando a mis actividades');
    // Implementar navegación real aquí
  }

  navigateToCertificates() {
    console.log('Navegando a certificados');
    // Implementar navegación real aquí
  }

  /**
   * Limpia los listeners
   */
  cleanup() {
    if (this.onTokenRefreshListener) {
      this.onTokenRefreshListener();
    }
    if (this.onMessageListener) {
      this.onMessageListener();
    }
    if (this.onNotificationOpenedAppListener) {
      this.onNotificationOpenedAppListener();
    }
  }

  /**
   * Obtiene el token FCM actual
   */
  getCurrentToken() {
    return this.fcmToken;
  }

  /**
   * Verifica si Firebase está inicializado
   */
  isReady() {
    return this.isInitialized;
  }
}

// Exportar instancia singleton
export const firebaseService = new FirebaseService();
export default firebaseService;