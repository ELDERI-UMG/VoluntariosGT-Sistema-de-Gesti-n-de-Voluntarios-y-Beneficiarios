import { apiClient } from './api.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
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
        // Verificar que el usuario tenga permisos de admin o entidad
        if (!['admin', 'entidad'].includes(response.user.rol)) {
          throw new Error('No tienes permisos para acceder al dashboard administrativo');
        }

        // Guardar tokens
        apiClient.saveTokens(
          response.session.access_token,
          response.session.refresh_token
        );

        // Guardar datos del usuario
        this.saveUserData(response.user);
        
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
      this.clearUserData();
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
      
      if (response.user) {
        this.saveUserData(response.user);
        this.currentUser = response.user;
      }

      return response.user;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  // Verificar si el usuario está autenticado
  async checkAuthStatus() {
    try {
      const token = apiClient.getAuthToken();
      const userData = this.getUserData();

      if (token && userData) {
        // Verificar que el token sea válido obteniendo el perfil
        try {
          const profile = await this.getProfile();
          
          // Verificar permisos
          if (!['admin', 'entidad'].includes(profile.rol)) {
            await this.logout();
            return false;
          }

          this.currentUser = profile;
          this.isAuthenticated = true;
          return true;
        } catch (error) {
          // Si falla, limpiar datos y requerir login
          this.clearUserData();
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

  // Guardar datos del usuario en localStorage
  saveUserData(userData) {
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
    }
  }

  // Obtener datos del usuario de localStorage
  getUserData() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // Limpiar datos del usuario
  clearUserData() {
    try {
      apiClient.clearTokens();
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

  // Verificar si es admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Verificar si es entidad
  isEntity() {
    return this.hasRole('entidad');
  }

  // Verificar múltiples roles
  hasAnyRole(roles) {
    return roles.includes(this.currentUser?.rol);
  }

  // Obtener información del rol
  getRoleInfo() {
    const role = this.currentUser?.rol;
    
    const roleInfo = {
      admin: {
        name: 'Administrador',
        description: 'Administrador del sistema',
        color: '#2C3E50',
        permissions: ['all']
      },
      entidad: {
        name: 'Entidad',
        description: 'Organización que publica actividades',
        color: '#E67E22',
        permissions: ['create_activities', 'manage_activities', 'view_reports']
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
      verified: this.currentUser.verificado === true,
      avatar: this.currentUser.avatar_url,
      phone: this.currentUser.telefono,
      joinDate: this.currentUser.created_at,
    };
  }

  // Validar formato de email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

export default authService;

