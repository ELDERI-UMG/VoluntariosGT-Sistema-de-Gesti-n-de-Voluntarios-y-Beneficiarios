import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { oneSignalSubscription } from '../services/oneSignalSubscription';
import { APP_CONFIG } from '../constants/config';

/**
 * Componente de diagnóstico para OneSignal
 * Solo visible en desarrollo para debuggear problemas de suscripción
 */
const OneSignalDebug = () => {
  const [deviceState, setDeviceState] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDeviceState();
    
    // Actualizar estado cada 10 segundos
    const interval = setInterval(loadDeviceState, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDeviceState = async () => {
    try {
      const state = await OneSignal.getDeviceState();
      setDeviceState(state);
    } catch (error) {
      console.error('Error obteniendo estado del dispositivo:', error);
    }
  };

  const runDiagnosis = async () => {
    setIsLoading(true);
    try {
      const result = await oneSignalSubscription.diagnoseSubscriptionIssues();
      setDiagnosis(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudo ejecutar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const forceSubscription = async () => {
    setIsLoading(true);
    try {
      const success = await oneSignalSubscription.forceSubscription();
      if (success) {
        Alert.alert('Éxito', 'Suscripción forzada exitosamente');
        await loadDeviceState();
      } else {
        Alert.alert('Error', 'No se pudo forzar la suscripción');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const retrySubscription = async () => {
    setIsLoading(true);
    try {
      const success = await oneSignalSubscription.retrySubscription();
      if (success) {
        Alert.alert('Éxito', 'Reintento de suscripción exitoso');
        await loadDeviceState();
      } else {
        Alert.alert('Error', 'El reintento falló');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!deviceState?.userId) {
      Alert.alert('Error', 'No hay User ID disponible');
      return;
    }

    try {
      // Aquí enviarías una notificación de prueba a través del backend
      Alert.alert('Info', `User ID: ${deviceState.userId}\n\nUsa este ID para enviar notificaciones de prueba desde el dashboard de OneSignal.`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!__DEV__) {
    return null; // Solo mostrar en desarrollo
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 OneSignal Debug</Text>
      
      {/* Estado del dispositivo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Estado del Dispositivo</Text>
        {deviceState ? (
          <View>
            <Text style={styles.item}>
              App ID: {APP_CONFIG.ONESIGNAL.APP_ID}
            </Text>
            <Text style={[styles.item, deviceState.isSubscribed ? styles.success : styles.error]}>
              Suscrito: {deviceState.isSubscribed ? '✅ Sí' : '❌ No'}
            </Text>
            <Text style={[styles.item, deviceState.hasNotificationPermission ? styles.success : styles.error]}>
              Permisos: {deviceState.hasNotificationPermission ? '✅ Otorgados' : '❌ Denegados'}
            </Text>
            <Text style={styles.item}>
              User ID: {deviceState.userId ? `${deviceState.userId.substring(0, 12)}...` : 'No disponible'}
            </Text>
            <Text style={styles.item}>
              Push Token: {deviceState.pushToken ? '✅ Presente' : '❌ Ausente'}
            </Text>
          </View>
        ) : (
          <Text style={styles.loading}>Cargando estado...</Text>
        )}
      </View>

      {/* Diagnóstico */}
      {diagnosis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Diagnóstico</Text>
          <Text style={styles.item}>
            Problemas encontrados: {diagnosis.issues.length}
          </Text>
          {diagnosis.issues.map((issue, index) => (
            <Text key={index} style={styles.error}>
              • {issue}
            </Text>
          ))}
          {diagnosis.recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendation}>
              💡 {rec}
            </Text>
          ))}
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={loadDeviceState}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Actualizar Estado</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={runDiagnosis}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔍 Diagnosticar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={forceSubscription}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔨 Forzar Suscripción</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.retryButton]} 
          onPress={retrySubscription}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={sendTestNotification}
          disabled={isLoading || !deviceState?.userId}
        >
          <Text style={styles.buttonText}>📱 Info para Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: '#f0f0f0',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  success: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  error: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  loading: {
    color: '#FF9800',
    fontStyle: 'italic',
  },
  recommendation: {
    color: '#2196F3',
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '48%',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  warningButton: {
    backgroundColor: '#F44336',
  },
  retryButton: {
    backgroundColor: '#9C27B0',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
};

export default OneSignalDebug;