import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { logger, requestLogger, errorLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './utils/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import actividadesRoutes from './routes/actividades.js';
import usuariosRoutes from './routes/usuarios.js';
import certificadosRoutes from './routes/certificados.js';
import notificacionesRoutes from './routes/notificaciones.js';
import reportesRoutes from './routes/reportes.js';
import oneSignalRoutes from './routes/oneSignalRoutes.js';

const app = express();

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuración de CORS
const allowedOrigins = config.cors.allowedOrigins;

// Log de dominios permitidos para debug
logger.info('CORS - Dominios permitidos', { allowedOrigins });

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida o es un patrón válido
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Manejar wildcards como *.vercel.app
        const regex = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      logger.debug('CORS permitido', { origin });
      callback(null, true);
    } else {
      logger.warn('CORS bloqueado', { origin, allowedOrigins });
      // En desarrollo, permitir todos los origins para testing
      if (config.nodeEnv === 'development') {
        logger.warn('Modo desarrollo: permitiendo origin bloqueado', { origin });
        callback(null, true);
      } else {
        callback(new Error('No permitido por la política CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control']
}));

// Rate limiting (reducido para desarrollo)
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 200, // máximo 200 requests por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 2 minutos.'
  }
});
app.use(limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging de peticiones
app.use(requestLogger);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/certificados', certificadosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/onesignal', oneSignalRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.1-admin-endpoint'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Voluntarios y Beneficiarios',
    version: '1.0.0',
    author: 'Elder Ramiro Ixcopal Arroyo',
    endpoints: {
      auth: '/api/auth',
      actividades: '/api/actividades',
      usuarios: '/api/usuarios',
      certificados: '/api/certificados',
      notificaciones: '/api/notificaciones',
      reportes: '/api/reportes',
      health: '/health'
    }
  });
});

// Middleware de logging de errores
app.use(errorLogger);

// Middleware de manejo de errores
app.use(errorHandler);

// Middleware para rutas no encontradas
app.use('*', notFoundHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Servidor iniciado correctamente', {
    port: PORT,
    environment: config.nodeEnv,
    url: `http://localhost:${PORT}`
  });
  
  // Limpiar logs antiguos al iniciar
  logger.cleanOldLogs(7);
});

export default app;

