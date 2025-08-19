import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

class ApiClient {
  constructor() {
    this.baseURL = APP_CONFIG.API_BASE_URL;
    this.timeout = APP_CONFIG.TIMEOUTS.API_REQUEST;
  }

  // Obtener token de autenticación
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem(APP_CONFIG.CACHE.TOKEN_KEY);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  // Obtener refresh token
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(APP_CONFIG.CACHE.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error al obtener refresh token:', error);
      return null;
    }
  }

  // Guardar tokens
  async saveTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem(APP_CONFIG.CACHE.TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(APP_CONFIG.CACHE.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error al guardar tokens:', error);
    }
  }

  // Limpiar tokens
  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        APP_CONFIG.CACHE.TOKEN_KEY,
        APP_CONFIG.CACHE.REFRESH_TOKEN_KEY,
        APP_CONFIG.CACHE.USER_KEY
      ]);
    } catch (error) {
      console.error('Error al limpiar tokens:', error);
    }
  }

  // Crear headers de la petición
  async createHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Manejar respuesta de la API
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.error || 'Error en la petición', response.status, data);
      }
      
      return data;
    } else {
      // Para respuestas no JSON (como PDFs)
      if (!response.ok) {
        throw new ApiError('Error en la petición', response.status);
      }
      return response;
    }
  }

  // Refrescar token de acceso
  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await this.handleResponse(response);
      
      await this.saveTokens(
        data.session.access_token,
        data.session.refresh_token
      );

      return data.session.access_token;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await this.clearTokens();
      throw error;
    }
  }

  // Realizar petición HTTP
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      includeAuth = true,
      isRetry = false,
      ...otherOptions
    } = options;

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.createHeaders(includeAuth);

      const config = {
        method,
        headers,
        ...otherOptions,
      };

      if (body) {
        if (body instanceof FormData) {
          // Para FormData, no establecer Content-Type (se establece automáticamente)
          delete config.headers['Content-Type'];
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      return await this.handleResponse(response);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Tiempo de espera agotado', 408);
      }

      // Si es error 401 y no es un retry, intentar refrescar token
      if (error.status === 401 && includeAuth && !isRetry) {
        try {
          await this.refreshAccessToken();
          // Reintentar la petición original
          return await this.request(endpoint, { ...options, isRetry: true });
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          throw error;
        }
      }

      throw error;
    }
  }

  // Métodos de conveniencia
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Subir archivo
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'upload.jpg',
    });

    // Agregar datos adicionales
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  // Descargar archivo
  async downloadFile(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }
}

// Clase de error personalizada para la API
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  // Verificar si es error de red
  isNetworkError() {
    return this.status === 0 || this.status === 408;
  }

  // Verificar si es error de autenticación
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  // Verificar si es error del servidor
  isServerError() {
    return this.status >= 500;
  }

  // Verificar si es error del cliente
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Funciones de utilidad para manejo de errores
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    if (error.isNetworkError()) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.isAuthError()) {
      return 'Error de autenticación. Por favor, inicia sesión nuevamente.';
    } else if (error.isServerError()) {
      return 'Error del servidor. Intenta nuevamente más tarde.';
    } else {
      return error.message || 'Error desconocido.';
    }
  }
  
  return 'Error inesperado. Intenta nuevamente.';
};

export default apiClient;

