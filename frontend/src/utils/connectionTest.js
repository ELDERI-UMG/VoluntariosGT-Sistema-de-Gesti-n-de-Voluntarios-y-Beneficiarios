import { APP_CONFIG } from '../constants/config';
import { apiClient } from '../services/api';

// Colores para logs en desarrollo
const colors = {
  success: '\x1b[32m✅',
  error: '\x1b[31m❌',
  warning: '\x1b[33m⚠️',
  info: '\x1b[34mℹ️',
  reset: '\x1b[0m'
};

const log = (level, message) => {
  if (__DEV__) {
    console.log(`${colors[level]} ${message}${colors.reset}`);
  }
};

// Test de conexión con el backend
export const testBackendConnection = async () => {
  log('info', 'Probando conexión con el backend...');
  log('info', `URL: ${APP_CONFIG.API_BASE_URL}`);
  
  try {
    // Test 1: Probar ruta raíz del servidor
    const rootUrl = APP_CONFIG.API_BASE_URL.replace('/api', '');
    const rootResponse = await fetch(rootUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (rootResponse.ok) {
      const data = await rootResponse.json();
      log('success', `Servidor conectado: ${data.message}`);
      log('info', `Versión: ${data.version}`);
      log('info', `Endpoints disponibles: ${Object.keys(data.endpoints).join(', ')}`);
    } else {
      log('error', `Error en servidor: ${rootResponse.status}`);
      return false;
    }
    
    // Test 2: Probar health check
    const healthResponse = await fetch(`${rootUrl}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      log('success', `Health check OK - Uptime: ${Math.floor(health.uptime)} segundos`);
      log('info', `Entorno: ${health.environment}`);
    }
    
    // Test 3: Probar endpoint de auth (sin autenticación)
    try {
      await apiClient.get('/auth/check');
    } catch (error) {
      if (error.status === 401) {
        log('success', 'Endpoint de auth funciona (401 esperado sin token)');
      } else {
        log('warning', `Auth endpoint: ${error.message}`);
      }
    }
    
    return true;
    
  } catch (error) {
    log('error', `Error de conexión: ${error.message}`);
    
    // Diagnóstico adicional
    if (error.message.includes('Network request failed')) {
      log('error', 'Error de red - Verifica tu conexión a internet');
    } else if (error.message.includes('timeout')) {
      log('error', 'Timeout - El servidor puede estar sobrecargado');
    } else {
      log('error', 'Error desconocido de conexión');
    }
    
    return false;
  }
};

// Test de conexión con Supabase
export const testSupabaseConnection = async () => {
  log('info', 'Probando conexión con Supabase...');
  log('info', `URL: ${APP_CONFIG.SUPABASE_URL}`);
  
  try {
    const response = await fetch(`${APP_CONFIG.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': APP_CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${APP_CONFIG.SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      log('success', 'Supabase conectado correctamente');
      return true;
    } else {
      log('error', `Error en Supabase: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    log('error', `Error de conexión con Supabase: ${error.message}`);
    return false;
  }
};

// Test completo de conectividad
export const runConnectivityTest = async () => {
  log('info', '🔍 INICIANDO TEST DE CONECTIVIDAD');
  log('info', `Modo: ${__DEV__ ? 'Desarrollo' : 'Producción'}`);
  log('info', `Plataforma: ${require('react-native').Platform.OS}`);
  console.log('=' .repeat(50));
  
  const results = {
    backend: false,
    supabase: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test Backend
    log('info', '\n1️⃣ Probando Backend...');
    results.backend = await testBackendConnection();
    
    // Test Supabase
    log('info', '\n2️⃣ Probando Supabase...');
    results.supabase = await testSupabaseConnection();
    
    // Resumen
    console.log('\n' + '='.repeat(50));
    log('info', '📊 RESUMEN DE CONECTIVIDAD:');
    log(results.backend ? 'success' : 'error', `Backend: ${results.backend ? 'OK' : 'FALLO'}`);
    log(results.supabase ? 'success' : 'error', `Supabase: ${results.supabase ? 'OK' : 'FALLO'}`);
    
    const allOk = results.backend && results.supabase;
    log(allOk ? 'success' : 'warning', 
      `Estado general: ${allOk ? 'TODOS LOS SERVICIOS OPERATIVOS' : 'ALGUNOS SERVICIOS CON PROBLEMAS'}`
    );
    
    if (!allOk) {
      log('info', '\n💡 RECOMENDACIONES:');
      if (!results.backend) {
        log('info', '  • Verifica que el backend esté desplegado en Render');
        log('info', '  • Revisa las variables de entorno del frontend');
        log('info', '  • Verifica tu conexión a internet');
      }
      if (!results.supabase) {
        log('info', '  • Verifica las credenciales de Supabase');
        log('info', '  • Revisa que el proyecto de Supabase esté activo');
      }
    }
    
    return results;
    
  } catch (error) {
    log('error', `Error durante el test: ${error.message}`);
    return results;
  }
};

// Hook para usar en componentes React Native
export const useConnectivityTest = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  
  const runTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await runConnectivityTest();
      setResults(testResults);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    runTest,
    isLoading,
    results,
    isConnected: results?.backend && results?.supabase
  };
};

// Función para mostrar información de configuración
export const showConfigInfo = () => {
  if (!__DEV__) return;
  
  log('info', '⚙️ INFORMACIÓN DE CONFIGURACIÓN:');
  log('info', `Backend URL: ${APP_CONFIG.API_BASE_URL}`);
  log('info', `Supabase URL: ${APP_CONFIG.SUPABASE_URL}`);
  log('info', `OneSignal App ID: ${APP_CONFIG.ONESIGNAL.APP_ID}`);
  log('info', `Timeout API: ${APP_CONFIG.TIMEOUTS.API_REQUEST}ms`);
  log('info', `Features habilitadas:`);
  Object.entries(APP_CONFIG.FEATURES).forEach(([key, value]) => {
    log('info', `  • ${key}: ${value ? 'SÍ' : 'NO'}`);
  });
};

export default {
  testBackendConnection,
  testSupabaseConnection,
  runConnectivityTest,
  useConnectivityTest,
  showConfigInfo
};