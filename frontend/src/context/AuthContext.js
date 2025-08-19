import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { handleApiError } from '../services/api';

// Estados del contexto de autenticación
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar estado de autenticación al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar si el usuario está autenticado
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const isAuthenticated = await authService.checkAuthStatus();
      
      if (isAuthenticated) {
        const user = authService.getCurrentUser();
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: handleApiError(error) });
    }
  };

  // Registrar nuevo usuario
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);
      const user = authService.getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(email, password);
      const user = authService.getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar logout local aunque falle el servidor
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.updateProfile(profileData);
      const user = authService.getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Actualizar DPI
  const updateDPI = async (dpi, dpiPhotoUrl) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.updateDPI(dpi, dpiPhotoUrl);
      const user = authService.getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const user = await authService.getProfile();
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      return user;
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Verificar rol del usuario
  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  // Verificar múltiples roles
  const hasAnyRole = (roles) => {
    return authService.hasAnyRole(roles);
  };

  // Verificar si el usuario está verificado
  const isVerified = () => {
    return authService.isVerified();
  };

  // Verificar permisos
  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  // Obtener información del rol
  const getRoleInfo = () => {
    return authService.getRoleInfo();
  };

  // Obtener información de display del usuario
  const getUserDisplayInfo = () => {
    return authService.getUserDisplayInfo();
  };

  // Validaciones
  const validateEmail = (email) => {
    return authService.validateEmail(email);
  };

  const validateDPI = (dpi) => {
    return authService.validateDPI(dpi);
  };

  const validatePassword = (password) => {
    return authService.validatePassword(password);
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Acciones de autenticación
    register,
    login,
    logout,
    updateProfile,
    updateDPI,
    refreshUser,
    clearError,

    // Verificaciones de rol y permisos
    hasRole,
    hasAnyRole,
    isVerified,
    hasPermission,
    getRoleInfo,
    getUserDisplayInfo,

    // Validaciones
    validateEmail,
    validateDPI,
    validatePassword,

    // Utilidades
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

