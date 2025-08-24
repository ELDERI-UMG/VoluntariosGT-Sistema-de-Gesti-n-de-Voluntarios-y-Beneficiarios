import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

// Tipos de errores del frontend
export class NetworkError extends Error {
  constructor(message = 'Error de conexión') {
    super(message);
    this.name = 'NetworkError';
    this.type = 'network';
  }
}

export class AuthError extends Error {
  constructor(message = 'Error de autenticación') {
    super(message);
    this.name = 'AuthError';
    this.type = 'auth';
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.type = 'validation';
    this.field = field;
  }
}

export class PermissionError extends Error {
  constructor(message = 'Permisos insuficientes') {
    super(message);
    this.name = 'PermissionError';
    this.type = 'permission';
  }
}

// Niveles de log
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class ErrorLogger {
  constructor() {
    this.logLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
    this.maxLogs = 100; // Máximo número de logs a mantener
  }

  // Formatear mensaje de log
  formatMessage(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
  }

  // Guardar log en AsyncStorage (solo errores importantes)
  async saveLog(logEntry) {
    try {
      const logs = await this.getLogs();
      logs.unshift(logEntry);
      
      // Mantener solo los últimos logs
      const trimmedLogs = logs.slice(0, this.maxLogs);
      
      await AsyncStorage.setItem(
        APP_CONFIG.CACHE.ERROR_LOGS_KEY || 'error_logs',
        JSON.stringify(trimmedLogs)
      );
    } catch (error) {
      // Si no podemos guardar los logs, solo los mostramos en consola
      console.error('Error saving log:', error);
    }
  }

  // Obtener logs guardados
  async getLogs() {
    try {
      const logsString = await AsyncStorage.getItem(
        APP_CONFIG.CACHE.ERROR_LOGS_KEY || 'error_logs'
      );
      return logsString ? JSON.parse(logsString) : [];
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  // Limpiar logs antiguos
  async clearOldLogs() {
    try {
      await AsyncStorage.removeItem(APP_CONFIG.CACHE.ERROR_LOGS_KEY || 'error_logs');
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }

  // Log genérico
  log(level, message, meta = {}) {
    const logEntry = this.formatMessage(level, message, meta);
    
    // Mostrar en consola basado en el nivel
    switch (level) {
      case 'DEBUG':
        if (this.logLevel <= LOG_LEVELS.DEBUG) {
          console.debug('🔍', logEntry);
        }
        break;
      case 'INFO':
        if (this.logLevel <= LOG_LEVELS.INFO) {
          console.info('ℹ️', logEntry);
        }
        break;
      case 'WARN':
        if (this.logLevel <= LOG_LEVELS.WARN) {
          console.warn('⚠️', logEntry);
        }
        break;
      case 'ERROR':
        console.error('🔴', logEntry);
        // Guardar errores críticos
        this.saveLog(logEntry);
        break;
    }
  }

  // Métodos de conveniencia
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }
}

// Instancia del logger
const errorLogger = new ErrorLogger();

// Manejo centralizado de errores
export const handleError = (error, context = '') => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  // Determinar tipo de error y acción apropiada
  if (error instanceof NetworkError || error.name === 'NetworkError') {
    errorLogger.warn('Network Error', errorInfo);
    return {
      title: 'Error de Conexión',
      message: 'Verifica tu conexión a internet e intenta nuevamente.',
      type: 'network',
      showRetry: true
    };
  }

  if (error instanceof AuthError || error.name === 'AuthError') {
    errorLogger.error('Auth Error', errorInfo);
    return {
      title: 'Error de Autenticación',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      type: 'auth',
      showRetry: false,
      requiresLogout: true
    };
  }

  if (error instanceof ValidationError || error.name === 'ValidationError') {
    errorLogger.info('Validation Error', errorInfo);
    return {
      title: 'Datos Inválidos',
      message: error.message,
      type: 'validation',
      showRetry: false,
      field: error.field
    };
  }

  if (error instanceof PermissionError || error.name === 'PermissionError') {
    errorLogger.warn('Permission Error', errorInfo);
    return {
      title: 'Permisos Insuficientes',
      message: error.message,
      type: 'permission',
      showRetry: false
    };
  }

  // Error de la API
  if (error.status) {
    switch (error.status) {
      case 400:
        errorLogger.info('Bad Request', errorInfo);
        return {
          title: 'Solicitud Inválida',
          message: error.message || 'Los datos enviados no son válidos.',
          type: 'validation',
          showRetry: false
        };
      
      case 401:
        errorLogger.error('Unauthorized', errorInfo);
        return {
          title: 'No Autorizado',
          message: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
          type: 'auth',
          requiresLogout: true
        };
      
      case 403:
        errorLogger.warn('Forbidden', errorInfo);
        return {
          title: 'Acceso Denegado',
          message: 'No tienes permisos para realizar esta acción.',
          type: 'permission'
        };
      
      case 404:
        errorLogger.info('Not Found', errorInfo);
        return {
          title: 'No Encontrado',
          message: 'El recurso solicitado no existe.',
          type: 'notfound'
        };
      
      case 408:
        errorLogger.warn('Timeout', errorInfo);
        return {
          title: 'Tiempo Agotado',
          message: 'La solicitud tardó demasiado. Intenta nuevamente.',
          type: 'timeout',
          showRetry: true
        };
      
      case 409:
        errorLogger.info('Conflict', errorInfo);
        return {
          title: 'Conflicto',
          message: error.message || 'Ya existe un recurso con esos datos.',
          type: 'conflict'
        };
      
      case 429:
        errorLogger.warn('Rate Limit', errorInfo);
        return {
          title: 'Demasiadas Solicitudes',
          message: 'Has realizado muchas solicitudes. Espera un momento.',
          type: 'ratelimit',
          showRetry: true
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        errorLogger.error('Server Error', errorInfo);
        return {
          title: 'Error del Servidor',
          message: 'Problema en el servidor. Intenta más tarde.',
          type: 'server',
          showRetry: true
        };
      
      default:
        errorLogger.error('Unknown HTTP Error', errorInfo);
        return {
          title: 'Error Desconocido',
          message: error.message || 'Ha ocurrido un error inesperado.',
          type: 'unknown',
          showRetry: true
        };
    }
  }

  // Error genérico
  errorLogger.error('Generic Error', errorInfo);
  return {
    title: 'Error Inesperado',
    message: __DEV__ ? error.message : 'Ha ocurrido un error. Intenta nuevamente.',
    type: 'generic',
    showRetry: true
  };
};

// Mostrar error con Alert nativo
export const showError = (error, context = '', options = {}) => {
  const errorInfo = handleError(error, context);
  
  const buttons = [];
  
  if (errorInfo.showRetry && options.onRetry) {
    buttons.push({
      text: 'Reintentar',
      onPress: options.onRetry
    });
  }
  
  if (errorInfo.requiresLogout && options.onLogout) {
    buttons.push({
      text: 'Cerrar Sesión',
      onPress: options.onLogout,
      style: 'destructive'
    });
  }
  
  buttons.push({
    text: 'OK',
    onPress: options.onDismiss
  });

  Alert.alert(
    errorInfo.title,
    errorInfo.message,
    buttons,
    { cancelable: false }
  );

  return errorInfo;
};

// Hook personalizado para manejar errores (para usar con componentes funcionales)
export const useErrorHandler = () => {
  const handleErrorWithAlert = (error, context = '', options = {}) => {
    return showError(error, context, options);
  };

  const handleSilentError = (error, context = '') => {
    return handleError(error, context);
  };

  return {
    handleError: handleErrorWithAlert,
    handleSilentError,
    showError
  };
};

// Función para reportar errores críticos (para envío futuro al servidor)
export const reportCriticalError = async (error, context = '', userInfo = {}) => {
  try {
    const errorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      userInfo,
      deviceInfo: {
        // Aquí podrías agregar información del dispositivo
        timestamp: new Date().toISOString()
      }
    };

    // Por ahora solo guardamos localmente
    // En el futuro podrías enviar esto a un servicio de monitoreo
    await errorLogger.saveLog({
      ...errorReport,
      level: 'CRITICAL',
      type: 'report'
    });

    errorLogger.error('Critical Error Reported', errorReport);
  } catch (reportError) {
    errorLogger.error('Failed to report critical error', {
      originalError: error.message,
      reportError: reportError.message
    });
  }
};

export { errorLogger };
export default {
  NetworkError,
  AuthError,
  ValidationError,
  PermissionError,
  handleError,
  showError,
  useErrorHandler,
  reportCriticalError,
  errorLogger
};