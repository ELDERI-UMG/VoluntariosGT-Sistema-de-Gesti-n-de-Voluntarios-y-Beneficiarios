import crypto from 'crypto';
import { config } from '../config.js';

/**
 * Valida el formato del DPI guatemalteco
 * @param {string} dpi - Número de DPI a validar
 * @returns {boolean} - True si el DPI es válido
 */
export const validateDPI = (dpi) => {
  if (!dpi || typeof dpi !== 'string') return false;
  
  // Verificar que tenga exactamente 13 dígitos
  if (!/^\d{13}$/.test(dpi)) return false;
  
  // Algoritmo de verificación del DPI guatemalteco
  const digits = dpi.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, num) => acc + num, 0);
  const checkDigit = sum % 10;
  
  return digits[12] === checkDigit;
};

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si el email es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida el formato de teléfono guatemalteco
 * @param {string} telefono - Número de teléfono a validar
 * @returns {boolean} - True si el teléfono es válido
 */
export const validateTelefono = (telefono) => {
  if (!telefono) return false;
  
  // Remover espacios y guiones
  const cleanPhone = telefono.replace(/[\s-]/g, '');
  
  // Formatos válidos para Guatemala:
  // 8 dígitos: 12345678
  // Con código de país: +50212345678 o 50212345678
  const phoneRegex = /^(\+502|502)?[2-9]\d{7}$/;
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Valida la fortaleza de una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - Objeto con isValid y errores
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('La contraseña es requerida');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
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
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida coordenadas geográficas
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {boolean} - True si las coordenadas son válidas
 */
export const validateCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};

/**
 * Valida que una fecha sea futura
 * @param {string|Date} fecha - Fecha a validar
 * @returns {boolean} - True si la fecha es futura
 */
export const validateFutureDate = (fecha) => {
  const date = new Date(fecha);
  const now = new Date();
  return date > now;
};

/**
 * Valida el formato de archivo permitido
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {boolean} - True si el tipo de archivo es permitido
 */
export const validateFileType = (mimetype) => {
  return config.files.allowedTypes.includes(mimetype);
};

/**
 * Valida el tamaño de archivo
 * @param {number} size - Tamaño del archivo en bytes
 * @returns {boolean} - True si el tamaño es válido
 */
export const validateFileSize = (size) => {
  return size <= config.files.maxSize;
};

/**
 * Sanitiza una cadena de texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

/**
 * Encripta datos sensibles usando AES-256
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado
 */
export const encryptSensitiveData = (text) => {
  if (!text) return '';
  
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(config.encryption.key, 'utf8');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('voluntarios-app', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Desencripta datos sensibles
 * @param {string} encryptedText - Texto encriptado
 * @returns {string} - Texto desencriptado
 */
export const decryptSensitiveData = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(config.encryption.key, 'utf8');
    
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('voluntarios-app', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return '';
  }
};

/**
 * Genera un hash seguro para contraseñas
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} - Hash de la contraseña
 */
export const hashPassword = async (password) => {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} - True si la contraseña es correcta
 */
export const verifyPassword = async (password, hash) => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
};

/**
 * Genera un token seguro aleatorio
 * @param {number} length - Longitud del token (por defecto 32)
 * @returns {string} - Token aleatorio
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Valida los datos de una actividad
 * @param {object} actividad - Datos de la actividad
 * @returns {object} - Resultado de la validación
 */
export const validateActividad = (actividad) => {
  const errors = [];
  
  if (!actividad.titulo || actividad.titulo.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres');
  }
  
  if (!actividad.descripcion || actividad.descripcion.trim().length < 20) {
    errors.push('La descripción debe tener al menos 20 caracteres');
  }
  
  if (!actividad.fecha_inicio || !validateFutureDate(actividad.fecha_inicio)) {
    errors.push('La fecha de inicio debe ser futura');
  }
  
  if (!actividad.fecha_fin || new Date(actividad.fecha_fin) <= new Date(actividad.fecha_inicio)) {
    errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
  }
  
  if (!actividad.cupos_totales || actividad.cupos_totales < 1) {
    errors.push('Debe haber al menos 1 cupo disponible');
  }
  
  if (!actividad.ubicacion || !actividad.ubicacion.lat || !actividad.ubicacion.lon) {
    errors.push('La ubicación es requerida');
  } else if (!validateCoordinates(actividad.ubicacion.lat, actividad.ubicacion.lon)) {
    errors.push('Las coordenadas de ubicación no son válidas');
  }
  
  if (!actividad.direccion_completa || actividad.direccion_completa.trim().length < 10) {
    errors.push('La dirección completa es requerida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateDPI,
  validateEmail,
  validateTelefono,
  validatePassword,
  validateCoordinates,
  validateFutureDate,
  validateFileType,
  validateFileSize,
  sanitizeText,
  encryptSensitiveData,
  decryptSensitiveData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateActividad
};

