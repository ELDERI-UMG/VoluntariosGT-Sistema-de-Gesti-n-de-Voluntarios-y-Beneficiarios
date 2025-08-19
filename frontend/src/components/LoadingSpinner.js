import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '../constants/colors';

const LoadingSpinner = ({ 
  size = 'large', 
  color = COLORS.primary, 
  text = null,
  fullScreen = false,
  backgroundColor = 'transparent'
}) => {
  const containerStyle = fullScreen 
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: backgroundColor === 'transparent' ? 'rgba(255, 255, 255, 0.9)' : backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }
    : {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text 
          style={{
            marginTop: 12,
            fontSize: 16,
            color: COLORS.textSecondary,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;

