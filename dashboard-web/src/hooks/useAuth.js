import { useState, useEffect, useCallback } from 'react';
import { authService } from '../lib/auth.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setError(error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Iniciar sesión
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
      setError(error.message);
      // Aún así limpiar el estado local
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Verificar rol
  const hasRole = useCallback((role) => {
    return authService.hasRole(role);
  }, [user]);

  // Verificar múltiples roles
  const hasAnyRole = useCallback((roles) => {
    return authService.hasAnyRole(roles);
  }, [user]);

  // Verificar permisos
  const hasPermission = useCallback((permission) => {
    return authService.hasPermission(permission);
  }, [user]);

  // Obtener información del rol
  const getRoleInfo = useCallback(() => {
    return authService.getRoleInfo();
  }, [user]);

  // Obtener información de usuario para mostrar
  const getUserDisplayInfo = useCallback(() => {
    return authService.getUserDisplayInfo();
  }, [user]);

  // Verificar si es admin
  const isAdmin = useCallback(() => {
    return authService.isAdmin();
  }, [user]);

  // Verificar si es entidad
  const isEntity = useCallback(() => {
    return authService.isEntity();
  }, [user]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Acciones
    login,
    logout,
    updateProfile,
    checkAuthStatus,
    clearError,
    
    // Verificaciones
    hasRole,
    hasAnyRole,
    hasPermission,
    isAdmin,
    isEntity,
    
    // Información
    getRoleInfo,
    getUserDisplayInfo,
  };
};

