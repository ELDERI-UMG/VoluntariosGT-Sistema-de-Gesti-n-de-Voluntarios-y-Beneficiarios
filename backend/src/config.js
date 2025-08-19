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
  }
};

export default { supabase, supabaseAdmin, config };

