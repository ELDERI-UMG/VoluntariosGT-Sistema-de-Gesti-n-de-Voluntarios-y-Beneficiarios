import { logger } from './logger.js';
import { config } from '../config.js';

// Tipos de errores personalizados
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.field = field;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Permisos insuficientes') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflicto con el estado actual') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.originalError = originalError;
  }
}

export class ExternalServiceError extends Error {
  constructor(service, message, originalError = null) {
    super(message);
    this.name = 'ExternalServiceError';
    this.status = 503;
    this.service = service;
    this.originalError = originalError;
  }
}

// Middleware principal de manejo de errores
export const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.apiError(err, req);

  // Determinar código de estado y mensaje
  let status = err.status || 500;
  let message = err.message;
  let details = {};

  // Manejar diferentes tipos de errores
  switch (err.name) {
    case 'ValidationError':
      status = 400;
      if (err.field) {
        details.field = err.field;
      }
      break;

    case 'AuthenticationError':
      status = 401;
      message = config.nodeEnv === 'production' ? 'No autorizado' : err.message;
      break;

    case 'AuthorizationError':
      status = 403;
      message = config.nodeEnv === 'production' ? 'Permisos insuficientes' : err.message;
      break;

    case 'NotFoundError':
      status = 404;
      break;

    case 'ConflictError':
      status = 409;
      break;

    case 'DatabaseError':
      status = 500;
      message = config.nodeEnv === 'production' ? 'Error interno de base de datos' : err.message;
      if (err.originalError && config.nodeEnv !== 'production') {
        details.originalError = err.originalError.message;
      }
      break;

    case 'ExternalServiceError':
      status = 503;
      message = config.nodeEnv === 'production' 
        ? `Servicio ${err.service} no disponible` 
        : err.message;
      if (err.service) {
        details.service = err.service;
      }
      break;

    // Errores de express-validator
    case 'ValidationResult':
      status = 400;
      message = 'Datos de entrada inválidos';
      details.errors = err.array();
      break;

    // Errores de parsing JSON
    case 'SyntaxError':
      if (err.type === 'entity.parse.failed') {
        status = 400;
        message = 'JSON inválido en el cuerpo de la solicitud';
      }
      break;

    // Errores de Supabase
    default:
      if (err.code) {
        switch (err.code) {
          case 'PGRST116':
            status = 406;
            message = 'Formato de respuesta no aceptable';
            break;
          case 'PGRST301':
            status = 404;
            message = 'Recurso no encontrado';
            break;
          case '23505': // Violación de restricción única
            status = 409;
            message = 'El recurso ya existe';
            break;
          case '23503': // Violación de clave foránea
            status = 400;
            message = 'Referencia inválida';
            break;
          case '42601': // Error de sintaxis SQL
            status = 500;
            message = config.nodeEnv === 'production' ? 'Error interno' : 'Error de consulta SQL';
            break;
          default:
            if (config.nodeEnv !== 'production') {
              details.supabaseCode = err.code;
            }
        }
      }
      
      // Error genérico del servidor
      if (status >= 500) {
        message = config.nodeEnv === 'production' 
          ? 'Error interno del servidor' 
          : err.message;
      }
  }

  // Respuesta de error
  const errorResponse = {
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Agregar detalles adicionales en desarrollo
  if (config.nodeEnv !== 'production') {
    errorResponse.error.stack = err.stack;
    if (Object.keys(details).length > 0) {
      errorResponse.error.details = details;
    }
  }

  res.status(status).json(errorResponse);
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    error: {
      message: error.message,
      status: 404,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  });
};

// Función utilitaria para capturar errores async
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Función para validar resultados de express-validator
export const validateRequest = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationError = new ValidationError('Datos de entrada inválidos');
    validationError.errors = errors.array();
    return next(validationError);
  }
  
  next();
};

// Función utilitaria para crear respuestas de éxito consistentes
export const sendSuccess = (res, data = null, message = 'Operación exitosa', status = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(status).json(response);
};

// Función utilitaria para crear respuestas paginadas
export const sendPaginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  res.json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

export default {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  sendSuccess,
  sendPaginatedResponse
};