import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { STYLE_CONFIG } from '../constants/config';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  style = {},
  inputStyle = {},
  containerStyle = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  // Estilos del contenedor principal
  const mainContainerStyle = {
    marginBottom: STYLE_CONFIG.spacing.md,
    ...containerStyle,
  };

  // Estilos de la etiqueta
  const labelStyle = {
    fontSize: STYLE_CONFIG.fontSize.sm,
    fontWeight: STYLE_CONFIG.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: STYLE_CONFIG.spacing.xs,
  };

  // Estilos del contenedor del input
  const inputContainerStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    borderWidth: 1,
    borderColor: error 
      ? COLORS.error 
      : isFocused 
        ? COLORS.primary 
        : COLORS.border,
    borderRadius: STYLE_CONFIG.borderRadius.lg,
    backgroundColor: editable ? COLORS.white : COLORS.gray[50],
    paddingHorizontal: STYLE_CONFIG.spacing.md,
    paddingVertical: multiline ? STYLE_CONFIG.spacing.md : STYLE_CONFIG.spacing.sm,
    minHeight: multiline ? 80 : 48,
    ...style,
  };

  // Estilos del input
  const textInputStyle = {
    flex: 1,
    fontSize: STYLE_CONFIG.fontSize.base,
    color: editable ? COLORS.textPrimary : COLORS.textSecondary,
    paddingVertical: 0, // Remover padding por defecto
    textAlignVertical: multiline ? 'top' : 'center',
    ...inputStyle,
  };

  // Estilos del texto de error
  const errorTextStyle = {
    fontSize: STYLE_CONFIG.fontSize.sm,
    color: COLORS.error,
    marginTop: STYLE_CONFIG.spacing.xs,
  };

  // Estilos del texto de ayuda
  const helperTextStyle = {
    fontSize: STYLE_CONFIG.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: STYLE_CONFIG.spacing.xs,
  };

  // Estilos de los iconos
  const iconStyle = {
    marginHorizontal: STYLE_CONFIG.spacing.xs,
  };

  // Manejar el toggle de visibilidad de contraseña
  const toggleSecureVisibility = () => {
    setIsSecureVisible(!isSecureVisible);
  };

  return (
    <View style={mainContainerStyle}>
      {/* Etiqueta */}
      {label && (
        <Text style={labelStyle}>
          {label}
        </Text>
      )}

      {/* Contenedor del input */}
      <View style={inputContainerStyle}>
        {/* Icono izquierdo */}
        {leftIcon && (
          <View style={iconStyle}>
            {leftIcon}
          </View>
        )}

        {/* Input de texto */}
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Icono derecho o toggle de contraseña */}
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={iconStyle}
            onPress={secureTextEntry ? toggleSecureVisibility : undefined}
            disabled={!secureTextEntry}
          >
            {secureTextEntry ? (
              <Text style={{ color: COLORS.textSecondary }}>
                {isSecureVisible ? '🙈' : '👁️'}
              </Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Contador de caracteres */}
      {maxLength && (
        <Text style={helperTextStyle}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}

      {/* Mensaje de error */}
      {error && (
        <Text style={errorTextStyle}>
          {error}
        </Text>
      )}

      {/* Texto de ayuda */}
      {helperText && !error && (
        <Text style={helperTextStyle}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;

