import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

// Configuración del sistema
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

// Servicios de inicialización
// import { initializeOneSignal } from './src/services/oneSignalInit';

// Suprimir warnings específicos en desarrollo
if (__DEV__) {
  LogBox.ignoreLogs([
    'Warning: Failed to load',
    'Warning: React.createFactory',
    '[Reanimated] Seems like you are using a Babel plugin',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Non-serializable values were found',
  ]);
}

export default function App() {
  useEffect(() => {
    // Inicializar servicios cuando la app se carga
    const initServices = async () => {
      try {
        console.log('🚀 Inicializando VoluntariosGT...');
        
        // TODO: Descomentar cuando OneSignal esté configurado
        // console.log('📱 Inicializando notificaciones push...');
        // await initializeOneSignal();
        
        console.log('✅ Servicios inicializados correctamente');
      } catch (error) {
        console.error('❌ Error inicializando servicios:', error);
      }
    };

    initServices();
  }, []);

  return (
    <AuthProvider>
      <StatusBar 
        style="dark" 
        backgroundColor={COLORS.white} 
        translucent={false}
      />
      <AppNavigator />
    </AuthProvider>
  );
}