import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { COLORS, STYLE_CONFIG } from '../constants/config';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style = {},
  textStyle = {},
  ...props
}) => {
  // Configuración de variantes
  const variants = {
    primary: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
      textColor: COLORS.white,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: COLORS.primary,
      textColor: COLORS.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: COLORS.gray[300],
      textColor: COLORS.textPrimary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: COLORS.primary,
    },
    success: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
      textColor: COLORS.white,
    },
    warning: {
      backgroundColor: COLORS.warning,
      borderColor: COLORS.warning,
      textColor: COLORS.white,
    },
    error: {
      backgroundColor: COLORS.error,
      borderColor: COLORS.error,
      textColor: COLORS.white,
    },
  };

  // Configuración de tamaños
  const sizes = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: STYLE_CONFIG.fontSize.sm,
      borderRadius: STYLE_CONFIG.borderRadius.md,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: STYLE_CONFIG.fontSize.base,
      borderRadius: STYLE_CONFIG.borderRadius.lg,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: STYLE_CONFIG.fontSize.lg,
      borderRadius: STYLE_CONFIG.borderRadius.xl,
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  // Estilos del botón
  const buttonStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: disabled ? COLORS.gray[300] : variantStyle.backgroundColor,
    borderColor: disabled ? COLORS.gray[300] : variantStyle.borderColor,
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: sizeStyle.borderRadius,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...STYLE_CONFIG.shadows.sm,
    ...style,
  };

  // Estilos del texto
  const buttonTextStyle = {
    fontSize: sizeStyle.fontSize,
    fontWeight: STYLE_CONFIG.fontWeight.semibold,
    color: disabled ? COLORS.gray[600] : variantStyle.textColor,
    textAlign: 'center',
    ...textStyle,
  };

  // Renderizar contenido del botón
  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator 
            size="small" 
            color={disabled ? COLORS.gray[600] : variantStyle.textColor} 
          />
          {title && (
            <Text style={[buttonTextStyle, { marginLeft: 8 }]}>
              {title}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && iconPosition === 'left' && (
          <View style={{ marginRight: title ? 8 : 0 }}>
            {icon}
          </View>
        )}
        
        {title && (
          <Text style={buttonTextStyle}>
            {title}
          </Text>
        )}
        
        {icon && iconPosition === 'right' && (
          <View style={{ marginLeft: title ? 8 : 0 }}>
            {icon}
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;

