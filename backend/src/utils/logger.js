import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Niveles de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.NODE_ENV === 'production';
  }

  // Formatear mensaje de log
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  // Escribir a archivo
  writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;

    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${level.toLowerCase()}-${today}.log`);

    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  // Método base de logging
  log(level, message, meta = {}) {
    const currentLevel = LOG_LEVELS[this.level.toUpperCase()] || LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level.toUpperCase()];

    if (messageLevel > currentLevel) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    // Log a consola con colores
    switch (level.toUpperCase()) {
      case 'ERROR':
        console.error(`🔴 ${formattedMessage}`);
        break;
      case 'WARN':
        console.warn(`🟡 ${formattedMessage}`);
        break;
      case 'INFO':
        console.info(`🔵 ${formattedMessage}`);
        break;
      case 'DEBUG':
        console.debug(`⚪ ${formattedMessage}`);
        break;
      default:
        console.log(`📝 ${formattedMessage}`);
    }

    // Escribir a archivo en producción
    this.writeToFile(level, formattedMessage);
  }

  // Métodos de conveniencia
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Log específico para peticiones HTTP
  request(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    this.info(`${req.method} ${req.originalUrl}`, meta);
  }

  // Log específico para errores de API
  apiError(error, req = null) {
    const meta = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    if (req) {
      meta.request = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      };
    }

    this.error('API Error', meta);
  }

  // Log específico para base de datos
  database(query, duration, error = null) {
    const meta = {
      query: query.substring(0, 200), // Limitar tamaño del query
      duration: `${duration}ms`
    };

    if (error) {
      meta.error = {
        message: error.message,
        code: error.code
      };
      this.error('Database Error', meta);
    } else {
      this.debug('Database Query', meta);
    }
  }

  // Limpiar logs antiguos
  cleanOldLogs(daysToKeep = 7) {
    if (!this.logToFile) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const files = fs.readdirSync(logsDir);
      
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Error cleaning old logs', { error: error.message });
    }
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Middleware para logging de peticiones
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capturar cuando la respuesta termina
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.request(req, res, responseTime);
  });

  next();
};

// Middleware para manejo de errores con logging
export const errorLogger = (err, req, res, next) => {
  logger.apiError(err, req);
  next(err);
};

export default logger;