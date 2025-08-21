import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

// Cliente público (para autenticación y operaciones normales)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Cliente administrativo (para operaciones que requieren privilegios elevados)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Configuración de la aplicación
export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_for_development',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  oneSignal: {
    appId: process.env.ONESIGNAL_APP_ID,
    restApiKey: process.env.ONESIGNAL_REST_API_KEY
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'fallback_encryption_key_32_chars!!'
  },
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf']
  },
  cors: {
    allowedOrigins: (() => {
      // Si existe FRONTEND_URL, usarlo como origen principal
      const frontendUrl = process.env.FRONTEND_URL;
      const corsOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(origin => origin.trim());
      
      // Origins base para desarrollo
      const baseOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081'
      ];
      
      // Si hay FRONTEND_URL específica, agregarla
      if (frontendUrl) {
        baseOrigins.push(frontendUrl);
      }
      
      // Agregar patrones de Vercel y dominio específico del dashboard
      baseOrigins.push('https://*.vercel.app');
      baseOrigins.push('https://voluntarios-gt-sistema-de-gesti-n-d.vercel.app');
      
      // Si hay CORS_ALLOWED_ORIGINS, combinarlos
      if (corsOrigins && corsOrigins.length > 0) {
        return [...new Set([...baseOrigins, ...corsOrigins])];
      }
      
      return baseOrigins;
    })()
  }
};

export default { supabase, supabaseAdmin, config };

