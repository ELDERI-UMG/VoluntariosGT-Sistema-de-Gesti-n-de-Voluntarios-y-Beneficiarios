// Cliente API para el dashboard administrativo
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.timeout = 30000;
  }

  // Obtener token de autenticación
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  // Obtener refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // Guardar tokens
  saveTokens(accessToken, refreshToken) {
    localStorage.setItem('auth_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Limpiar tokens
  clearTokens() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Crear headers de la petición
  createHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
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
      const refreshToken = this.getRefreshToken();
      
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
      
      this.saveTokens(
        data.token,
        data.refreshToken
      );

      return data.token;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      this.clearTokens();
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
      const headers = this.createHeaders(includeAuth);

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
    
    formData.append('file', file);

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

