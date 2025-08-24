import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS } from '../constants/colors';
import { APP_CONFIG, STYLE_CONFIG } from '../constants/config';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }

    // Limpiar error general
    if (error) {
      clearError();
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
      // La navegación se maneja automáticamente por el AuthContext
    } catch (err) {
      // El error se maneja en el AuthContext
      console.error('Error en login:', err);
    }
  };

  // Navegar a registro
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: STYLE_CONFIG.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo y título */}
          <View style={{ alignItems: 'center', marginBottom: STYLE_CONFIG.spacing.xxl }}>
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: COLORS.primary,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: STYLE_CONFIG.spacing.lg,
              }}
            >
              <Text style={{ fontSize: 40, color: COLORS.white }}>🤝</Text>
            </View>
            
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize['3xl'],
                fontWeight: STYLE_CONFIG.fontWeight.bold,
                color: COLORS.primary,
                textAlign: 'center',
                marginBottom: STYLE_CONFIG.spacing.sm,
              }}
            >
              VoluntariosGT
            </Text>
            
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.base,
                color: COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Conectando voluntarios con{'\n'}comunidades que necesitan ayuda
            </Text>
          </View>

          {/* Formulario de login */}
          <View style={{ marginBottom: STYLE_CONFIG.spacing.xl }}>
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.xl,
                fontWeight: STYLE_CONFIG.fontWeight.semibold,
                color: COLORS.textPrimary,
                textAlign: 'center',
                marginBottom: STYLE_CONFIG.spacing.lg,
              }}
            >
              Iniciar Sesión
            </Text>

            {/* Error general */}
            {error && (
              <View
                style={{
                  backgroundColor: COLORS.error + '10',
                  borderColor: COLORS.error,
                  borderWidth: 1,
                  borderRadius: STYLE_CONFIG.borderRadius.lg,
                  padding: STYLE_CONFIG.spacing.md,
                  marginBottom: STYLE_CONFIG.spacing.md,
                }}
              >
                <Text style={{ color: COLORS.error, textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Campo de email */}
            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={formErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Text style={{ color: COLORS.textSecondary }}>📧</Text>}
            />

            {/* Campo de contraseña */}
            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={formErrors.password}
              secureTextEntry={true}
              leftIcon={<Text style={{ color: COLORS.textSecondary }}>🔒</Text>}
            />

            {/* Botón de login */}
            <Button
              title="Iniciar Sesión"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={{ marginTop: STYLE_CONFIG.spacing.md }}
            />
          </View>

          {/* Enlaces adicionales */}
          <View style={{ alignItems: 'center' }}>
            <Button
              title="¿No tienes cuenta? Regístrate"
              onPress={navigateToRegister}
              variant="ghost"
              disabled={isLoading}
            />
          </View>

          {/* Información adicional */}
          <View
            style={{
              marginTop: STYLE_CONFIG.spacing.xl,
              padding: STYLE_CONFIG.spacing.md,
              backgroundColor: COLORS.backgroundSecondary,
              borderRadius: STYLE_CONFIG.borderRadius.lg,
            }}
          >
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.sm,
                color: COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Al iniciar sesión, aceptas nuestros{' '}
              <Text style={{ color: COLORS.primary }}>Términos de Servicio</Text>
              {' '}y{' '}
              <Text style={{ color: COLORS.primary }}>Política de Privacidad</Text>
            </Text>
          </View>
        </ScrollView>

        {/* Loading overlay */}
        {isLoading && (
          <LoadingSpinner
            fullScreen
            text="Iniciando sesión..."
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

