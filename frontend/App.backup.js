import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { initializeOneSignal } from './src/services/oneSignalInit';

export default function App() {
  useEffect(() => {
    // Inicializar OneSignal cuando la app se carga
    const initOneSignal = async () => {
      try {
        await initializeOneSignal();
      } catch (error) {
        console.error('Error inicializando OneSignal:', error);
      }
    };
    
    initOneSignal();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      <AppNavigator />
    </AuthProvider>
  );
}