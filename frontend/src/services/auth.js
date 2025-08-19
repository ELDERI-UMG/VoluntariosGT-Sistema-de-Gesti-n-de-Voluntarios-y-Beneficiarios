import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ApiError } from './api';
import { APP_CONFIG } from '../constants/config';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData, {
        includeAuth: false
      });

      if (response.user) {
        await this.saveUserData(response.user);
        this.currentUser = response.user;
        this.isAuthenticated = true;
      }

      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      }, {
        includeAuth: false
      });

      if (response.session && response.user) {
        // Guardar tokens
        await apiClient.saveTokens(
          response.session.access_token,
          response.session.refresh_token
        );

        // Guardar datos del usuario
        await this.saveUserData(response.user);
        
        this.currentUser = response.user;
        this.isAuthenticated = true;
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      // Intentar cerrar sesión en el servidor
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn('Error al cerrar sesión en servidor:', error);
        // Continuar con logout local aunque falle el servidor
      }

      // Limpiar datos locales
      await this.clearUserData();
      this.currentUser = null;
      this.isAuthenticated = false;

      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  // Obtener perfil del usuario actual
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      
      if (response.perfil) {
        await this.saveUserData(response.perfil);
        this.currentUser = response.perfil;
      }

      return response.perfil;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      
      if (response.perfil) {
        await this.saveUserData(response.perfil);
        this.currentUser = response.perfil;
      }

      return response;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  // Actualizar DPI
  async updateDPI(dpi, dpiPhotoUrl) {
    try {
      const response = await apiClient.put('/usuarios/dpi', {
        dpi,
        dpi_foto_url: dpiPhotoUrl
      });

      if (response.perfil) {
        await this.saveUserData(response.perfil);
        this.currentUser = response.perfil;
      }

      return response;
    } catch (error) {
      console.error('Error al actualizar DPI:', error);
      throw error;
    }
  }

  // Verificar si el usuario está autenticado
  async checkAuthStatus() {
    try {
      const token = await apiClient.getAuthToken();
      const userData = await this.getUserData();

      if (token && userData) {
        // Verificar que el token sea válido obteniendo el perfil
        try {
          const profile = await this.getProfile();
          this.currentUser = profile;
          this.isAuthenticated = true;
          return true;
        } catch (error) {
          // Si falla, limpiar datos y requerir login
          await this.clearUserData();
          this.currentUser = null;
          this.isAuthenticated = false;
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      return false;
    }
  }

  // Guardar datos del usuario en AsyncStorage
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(
        APP_CONFIG.CACHE.USER_KEY,
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
    }
  }

  // Obtener datos del usuario de AsyncStorage
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(APP_CONFIG.CACHE.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // Limpiar datos del usuario
  async clearUserData() {
    try {
      await apiClient.clearTokens();
    } catch (error) {
      console.error('Error al limpiar datos del usuario:', error);
    }
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar si está autenticado
  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  // Verificar rol del usuario
  hasRole(role) {
    return this.currentUser?.rol === role;
  }

  // Verificar si el usuario está verificado
  isVerified() {
    return this.currentUser?.verificado === true;
  }

  // Verificar múltiples roles
  hasAnyRole(roles) {
    return roles.includes(this.currentUser?.rol);
  }

  // Obtener información del rol
  getRoleInfo() {
    const role = this.currentUser?.rol;
    
    const roleInfo = {
      voluntario: {
        name: 'Voluntario',
        description: 'Persona que ofrece su tiempo para ayudar',
        color: '#3498DB',
        permissions: ['view_activities', 'join_activities', 'view_certificates']
      },
      beneficiario: {
        name: 'Beneficiario',
        description: 'Persona que recibe ayuda de voluntarios',
        color: '#9B59B6',
        permissions: ['view_activities', 'join_activities', 'view_certificates']
      },
      entidad: {
        name: 'Entidad',
        description: 'Organización que publica actividades',
        color: '#E67E22',
        permissions: ['create_activities', 'manage_activities', 'view_reports']
      },
      admin: {
        name: 'Administrador',
        description: 'Administrador del sistema',
        color: '#2C3E50',
        permissions: ['all']
      }
    };

    return roleInfo[role] || null;
  }

  // Validar permisos
  hasPermission(permission) {
    const roleInfo = this.getRoleInfo();
    
    if (!roleInfo) return false;
    
    return roleInfo.permissions.includes('all') || 
           roleInfo.permissions.includes(permission);
  }

  // Formatear datos de usuario para mostrar
  getUserDisplayInfo() {
    if (!this.currentUser) return null;

    return {
      id: this.currentUser.id,
      name: this.currentUser.nombre_completo,
      email: this.currentUser.email,
      role: this.getRoleInfo(),
      verified: this.isVerified(),
      avatar: this.currentUser.avatar_url,
      phone: this.currentUser.telefono,
      reputation: this.currentUser.puntos_reputacion || 0,
      joinDate: this.currentUser.created_at,
    };
  }

  // Validar formato de email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar formato de DPI guatemalteco
  validateDPI(dpi) {
    if (!dpi || typeof dpi !== 'string') return false;
    
    // Verificar que tenga exactamente 13 dígitos
    if (!/^\d{13}$/.test(dpi)) return false;
    
    // Algoritmo de verificación del DPI guatemalteco
    const digits = dpi.split('').map(Number);
    const sum = digits.slice(0, 12).reduce((acc, num) => acc + num, 0);
    const checkDigit = sum % 10;
    
    return digits[12] === checkDigit;
  }

  // Validar fortaleza de contraseña
  validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors };
    }
    
    if (password.length < APP_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${APP_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

export default authService;

