import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const GradientBackground = ({ 
  children, 
  colors = COLORS.gradientPrimary, 
  style = {},
  locations = [0, 1],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 }
}) => {
  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      start={start}
      end={end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;