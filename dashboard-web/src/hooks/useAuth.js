import { useState, useEffect, useCallback } from 'react';
import { authService } from '../lib/auth.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar si hay tokens almacenados antes de hacer la llamada
      const token = authService.getUserData();
      if (!token) {
        console.log('🔍 useAuth: No hay datos de usuario almacenados');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        console.log('✅ useAuth: Autenticación verificada exitosamente');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ useAuth: Autenticación falló');
      }
    } catch (error) {
      console.error('❌ useAuth: Error al verificar autenticación:', error);
      // No mostrar error en UI para evitar confusión
      setError(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Iniciar sesión
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔄 useAuth: Iniciando login...');
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      console.log('📥 useAuth: Respuesta del servicio:', response);
      
      if (response.user) {
        console.log('👤 useAuth: Actualizando usuario:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ useAuth: Estado actualizado - isAuthenticated: true');
        
        // Forzar actualización del estado para asegurar re-render
        setTimeout(() => {
          console.log('🔄 useAuth: Forzando verificación de estado...');
          setForceUpdate(prev => prev + 1); // Force re-render
          console.log('✅ useAuth: Estado re-confirmado');
        }, 50);
      } else {
        console.warn('⚠️ useAuth: No se recibió usuario en la respuesta');
      }
      
      return response;
    } catch (error) {
      console.error('❌ useAuth: Error en login:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 useAuth: Login completado, isLoading: false');
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
    forceUpdate, // Include force update to trigger re-renders
    
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

