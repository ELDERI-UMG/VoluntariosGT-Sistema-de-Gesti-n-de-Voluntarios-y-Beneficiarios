import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';

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
console.log('🌐 CORS - Dominios permitidos:', allowedOrigins);

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
      console.log('✅ CORS permitido para:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para:', origin);
      console.log('Dominios permitidos:', allowedOrigins);
      // En desarrollo, permitir todos los origins para testing
      if (config.nodeEnv === 'development') {
        console.log('⚠️ Modo desarrollo: permitiendo origin bloqueado');
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

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
    environment: config.nodeEnv
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

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido en el cuerpo de la solicitud'
    });
  }
  
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack })
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}`);
});

export default app;

