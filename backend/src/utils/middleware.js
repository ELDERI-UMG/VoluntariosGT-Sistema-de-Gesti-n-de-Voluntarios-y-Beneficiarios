import { supabase } from '../config.js';

/**
 * Middleware para autenticar usuarios usando JWT de Supabase
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido o expirado'
      });
    }

    // Obtener perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      return res.status(404).json({
        error: 'Perfil de usuario no encontrado'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      rol: perfil.rol,
      verificado: perfil.verificado,
      perfil: perfil
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const userRole = req.user.rol;
    
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción',
        required_roles: rolesPermitidos,
        user_role: userRole
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario esté verificado
 */
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  if (!req.user.verificado) {
    return res.status(403).json({
      error: 'Tu cuenta debe estar verificada para realizar esta acción'
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware para verificar que el usuario sea entidad
 */
export const requireEntidad = requireRole(['entidad', 'admin']);

/**
 * Middleware para verificar que el usuario sea voluntario o beneficiario
 */
export const requireVoluntario = requireRole(['voluntario', 'beneficiario', 'admin']);

/**
 * Middleware para logging de requests
 */
export const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  next();
};

/**
 * Middleware para validar parámetros de paginación
 */
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      error: 'El parámetro "page" debe ser un número mayor a 0'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      error: 'El parámetro "limit" debe ser un número entre 1 y 100'
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
  
  next();
};

/**
 * Middleware para validar coordenadas geográficas
 */
export const validateCoordinates = (req, res, next) => {
  const { lat, lon } = req.query;
  
  if (lat !== undefined && lon !== undefined) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Las coordenadas deben ser números válidos'
      });
    }
    
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'La latitud debe estar entre -90 y 90'
      });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'La longitud debe estar entre -180 y 180'
      });
    }
    
    req.coordinates = { lat: latitude, lon: longitude };
  }
  
  next();
};

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors
    });
  }
  
  next(error);
};

/**
 * Middleware para rate limiting por usuario
 */
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(); // Si no hay usuario, continuar (será manejado por authenticateUser)
    }
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpiar requests antiguos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId);
      const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
      requests.set(userId, validRequests);
    }
    
    // Obtener requests actuales del usuario
    const userRequests = requests.get(userId) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }
    
    // Agregar request actual
    userRequests.push(now);
    requests.set(userId, userRequests);
    
    next();
  };
};

export default {
  authenticateUser,
  requireRole,
  requireVerified,
  requireAdmin,
  requireEntidad,
  requireVoluntario,
  logRequest,
  validatePagination,
  validateCoordinates,
  handleValidationErrors,
  userRateLimit
};

