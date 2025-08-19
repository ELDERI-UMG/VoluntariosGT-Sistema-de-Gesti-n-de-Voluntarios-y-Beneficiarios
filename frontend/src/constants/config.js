// Configuración de la aplicación
export const APP_CONFIG = {
  // Información de la app
  name: 'VoluntariosGT',
  version: '1.0.0',
  description: 'Sistema de Gestión de Voluntarios y Beneficiarios para Guatemala',
  
  // URLs del backend
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:5000/api'  // Desarrollo
    : 'https://tu-backend-produccion.com/api', // Producción
  
  // Configuración de Supabase
  SUPABASE_URL: 'https://cicwxpdkikzeboeggmje.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3d4cGRraWt6ZWJvZWdnbWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NzU1ODksImV4cCI6MjA3MTE1MTU4OX0.wovhHu2oOato__PovFmVWkCa9ujFZOT8BJRx9VauYFo',
  
  // Configuración de mapas
  MAPS: {
    // Coordenadas de Guatemala
    DEFAULT_REGION: {
      latitude: 14.6349,
      longitude: -90.5069,
      latitudeDelta: 2.0,
      longitudeDelta: 2.0,
    },
    
    // Radio de búsqueda por defecto (km)
    DEFAULT_SEARCH_RADIUS: 5,
    
    // Límites de Guatemala
    GUATEMALA_BOUNDS: {
      north: 17.8193,
      south: 13.7373,
      east: -88.2256,
      west: -92.2714,
    },
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  
  // Configuración de archivos
  FILES: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  
  // Configuración de validación
  VALIDATION: {
    DPI_LENGTH: 13,
    MIN_PASSWORD_LENGTH: 8,
    MIN_NAME_LENGTH: 2,
    MIN_DESCRIPTION_LENGTH: 20,
    MIN_ACTIVITY_TITLE_LENGTH: 5,
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    REMINDER_HOURS_BEFORE: 24,
    MAX_NOTIFICATIONS_PER_PAGE: 20,
  },
  
  // Configuración de cache
  CACHE: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_data',
    SETTINGS_KEY: 'app_settings',
    LOCATION_KEY: 'user_location',
  },
  
  // Configuración de timeouts
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 segundos
    LOCATION_REQUEST: 10000, // 10 segundos
    IMAGE_UPLOAD: 60000, // 60 segundos
  },
  
  // Configuración de features
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_LOCATION_SERVICES: true,
    ENABLE_CAMERA: true,
    ENABLE_OFFLINE_MODE: false, // Para futuras versiones
    ENABLE_BIOMETRIC_AUTH: false, // Para futuras versiones
  },
  
  // URLs externas
  EXTERNAL_URLS: {
    PRIVACY_POLICY: 'https://voluntarios-gt.com/privacy',
    TERMS_OF_SERVICE: 'https://voluntarios-gt.com/terms',
    SUPPORT_EMAIL: 'soporte@voluntarios-gt.com',
    WEBSITE: 'https://voluntarios-gt.com',
  },
  
  // Configuración de desarrollo
  DEBUG: {
    ENABLE_LOGS: __DEV__,
    ENABLE_REDUX_DEVTOOLS: __DEV__,
    SHOW_PERFORMANCE_MONITOR: __DEV__,
  },
};

// Configuración específica por plataforma
export const PLATFORM_CONFIG = {
  android: {
    statusBarStyle: 'dark-content',
    navigationBarColor: '#FFFFFF',
  },
  ios: {
    statusBarStyle: 'dark-content',
    barStyle: 'default',
  },
};

// Configuración de estilos globales
export const STYLE_CONFIG = {
  // Espaciado
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Bordes redondeados
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Sombras
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Tamaños de fuente
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Pesos de fuente
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export default APP_CONFIG;

