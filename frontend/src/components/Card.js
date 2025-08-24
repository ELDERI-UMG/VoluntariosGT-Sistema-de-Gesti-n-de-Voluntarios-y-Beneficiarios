import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { STYLE_CONFIG } from '../constants/config';

const Card = ({
  children,
  style = {},
  onPress = null,
  shadow = 'md',
  padding = STYLE_CONFIG.spacing.md,
  borderRadius = STYLE_CONFIG.borderRadius.lg,
  backgroundColor = COLORS.white,
  ...props
}) => {
  const cardStyle = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    padding: padding,
    ...STYLE_CONFIG.shadows[shadow],
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

export default Card;