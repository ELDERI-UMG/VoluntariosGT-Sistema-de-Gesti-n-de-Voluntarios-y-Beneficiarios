import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STYLE_CONFIG } from '../constants/config';

const MapScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: STYLE_CONFIG.spacing.lg 
      }}>
        <Text style={{ 
          fontSize: 48, 
          marginBottom: STYLE_CONFIG.spacing.lg 
        }}>
          🗺️
        </Text>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize['2xl'],
          fontWeight: STYLE_CONFIG.fontWeight.bold,
          color: COLORS.textPrimary,
          textAlign: 'center',
          marginBottom: STYLE_CONFIG.spacing.md,
        }}>
          Mapa de Actividades
        </Text>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.base,
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}>
          Explora las actividades de voluntariado cerca de tu ubicación en Guatemala.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

