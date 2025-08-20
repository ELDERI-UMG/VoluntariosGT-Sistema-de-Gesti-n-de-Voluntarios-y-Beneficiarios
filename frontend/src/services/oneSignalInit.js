import { OneSignal } from 'react-native-onesignal';
import { APP_CONFIG } from '../constants/config';
import notificationService from './notificationService';
import { oneSignalSubscription } from './oneSignalSubscription';

/**
 * Inicializa OneSignal en la aplicación
 * Este archivo debe ser importado en App.js
 */
export const initializeOneSignal = async () => {
  console.log('🚀 Inicializando OneSignal...');
  console.log('App ID:', APP_CONFIG.ONESIGNAL.APP_ID);
  
  // Configurar OneSignal
  OneSignal.initialize(APP_CONFIG.ONESIGNAL.APP_ID);
  
  // Configurar el nivel de logs para debug
  OneSignal.Debug.setLogLevel(6); // Verbose - siempre habilitado para debug
  
  console.log('✅ OneSignal inicializado con logs de debug habilitados');

  // Configurar los listeners
  setupOneSignalListeners();

  // Inicializar suscripción automática
  setTimeout(async () => {
    try {
      console.log('🔄 Iniciando suscripción automática...');
      const subscribed = await oneSignalSubscription.initializeSubscription();
      
      if (!subscribed) {
        console.log('⚠️ Primera suscripción falló, reintentando...');
        await oneSignalSubscription.retrySubscription();
      }
    } catch (error) {
      console.error('Error en suscripción automática:', error);
    }
  }, 3000); // Esperar 3 segundos después de la inicialización

  console.log('OneSignal completamente configurado');
};

/**
 * Configura los listeners de OneSignal
 */
const setupOneSignalListeners = () => {
  // Listener para cuando se hace clic en una notificación
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('OneSignal: notificación clickeada', event);
    
    const data = event.notification.additionalData || {};
    handleNotificationAction(data);
  });

  // Listener para cuando se recibe una notificación mientras la app está en primer plano
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    console.log('OneSignal: notificación en primer plano', event);
    
    // La notificación se mostrará automáticamente
    event.getNotification().display();
  });

  // Listener para cambios en el estado de suscripción push
  OneSignal.User.pushSubscription.addEventListener('change', (event) => {
    console.log('OneSignal: cambio en suscripción push', event);
    
    if (event.current.token) {
      console.log('Token push:', event.current.token);
      // Guardar el token si es necesario
      notificationService.savePushToken(event.current.token);
    }
  });

  // Listener para cambios en el usuario
  OneSignal.User.addEventListener('change', (event) => {
    console.log('OneSignal: cambio en usuario', event);
  });
};

/**
 * Maneja las acciones cuando se hace clic en una notificación
 */
const handleNotificationAction = (data) => {
  console.log('Manejando acción de notificación:', data);

  // Aquí puedes agregar la lógica de navegación según el tipo de notificación
  switch (data.type) {
    case 'new_activity':
      console.log('Navegando a nueva actividad:', data.activity_id);
      // Implementar navegación a la actividad
      break;
      
    case 'inscription_accepted':
      console.log('Inscripción aceptada para actividad:', data.activity_id);
      // Implementar navegación o mostrar mensaje
      break;
      
    case 'activity_reminder':
      console.log('Recordatorio de actividad:', data.activity_id);
      // Implementar navegación o mostrar recordatorio
      break;
      
    case 'certificate_ready':
      console.log('Certificado listo:', data.certificate_id);
      // Implementar navegación a certificados
      break;
      
    default:
      console.log('Tipo de notificación no manejado:', data.type);
  }
};

/**
 * Configura el usuario en OneSignal
 */
export const setupOneSignalUser = async (userId, userType, userData = {}) => {
  try {
    console.log('Configurando usuario OneSignal:', userId, userType);
    
    // Login del usuario con su ID
    OneSignal.login(userId.toString());
    
    // Configurar tags del usuario
    const tags = {
      user_id: userId.toString(),
      user_type: userType,
      platform: 'react-native',
      app_version: APP_CONFIG.version,
      ...userData
    };
    
    OneSignal.User.addTags(tags);
    
    console.log('Usuario OneSignal configurado con tags:', tags);
    
    // Obtener el ID de OneSignal para debugging
    const oneSignalId = await OneSignal.User.getOnesignalId();
    console.log('OneSignal User ID:', oneSignalId);
    
    return oneSignalId;
  } catch (error) {
    console.error('Error configurando usuario OneSignal:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario en OneSignal
 */
export const logoutOneSignalUser = () => {
  try {
    console.log('Cerrando sesión de usuario OneSignal');
    OneSignal.logout();
  } catch (error) {
    console.error('Error al hacer logout de OneSignal:', error);
  }
};

/**
 * Configura la ubicación del usuario para notificaciones geolocalizadas
 */
export const setOneSignalLocation = async (latitude, longitude) => {
  try {
    console.log('Configurando ubicación OneSignal:', latitude, longitude);
    OneSignal.Location.setShared([latitude, longitude]);
  } catch (error) {
    console.error('Error configurando ubicación OneSignal:', error);
  }
};

/**
 * Obtiene el estado actual de las notificaciones
 */
export const getNotificationPermissionStatus = async () => {
  try {
    const permission = await OneSignal.Notifications.getPermissionAsync();
    console.log('Estado de permisos de notificación:', permission);
    return permission;
  } catch (error) {
    console.error('Error obteniendo estado de permisos:', error);
    return false;
  }
};

/**
 * Habilita o deshabilita las notificaciones
 */
export const setNotificationPreference = async (enabled) => {
  try {
    if (enabled) {
      OneSignal.User.pushSubscription.optIn();
    } else {
      OneSignal.User.pushSubscription.optOut();
    }
    console.log('Preferencia de notificaciones actualizada:', enabled);
  } catch (error) {
    console.error('Error actualizando preferencia de notificaciones:', error);
  }
};

export default {
  initializeOneSignal,
  setupOneSignalUser,
  logoutOneSignalUser,
  setOneSignalLocation,
  getNotificationPermissionStatus,
  setNotificationPreference
};