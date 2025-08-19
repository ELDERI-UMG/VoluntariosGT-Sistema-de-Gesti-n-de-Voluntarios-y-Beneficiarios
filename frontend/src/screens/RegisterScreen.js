import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, STYLE_CONFIG, APP_CONFIG } from '../constants/config';

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading, error, clearError, validateEmail, validateDPI, validatePassword } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    dpi: '',
    password: '',
    confirmPassword: '',
    rol: 'voluntario',
    genero: '',
    fecha_nacimiento: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Validar paso actual
  const validateCurrentStep = () => {
    const errors = {};

    if (currentStep === 1) {
      // Validar información básica
      if (!formData.nombre_completo.trim() || formData.nombre_completo.trim().length < 2) {
        errors.nombre_completo = 'El nombre debe tener al menos 2 caracteres';
      }

      if (!formData.email.trim()) {
        errors.email = 'El email es requerido';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Formato de email inválido';
      }

      if (!formData.rol) {
        errors.rol = 'Selecciona un rol';
      }

    } else if (currentStep === 2) {
      // Validar información adicional
      if (formData.telefono && !/^(\+502|502)?[2-9]\d{7}$/.test(formData.telefono.replace(/[\s-]/g, ''))) {
        errors.telefono = 'Formato de teléfono inválido para Guatemala';
      }

      if (formData.dpi && !validateDPI(formData.dpi)) {
        errors.dpi = 'Número de DPI inválido';
      }

    } else if (currentStep === 3) {
      // Validar contraseñas
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
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

    // Limpiar error del campo
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

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      const userData = {
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || null,
        dpi: formData.dpi.trim() || null,
        password: formData.password,
        rol: formData.rol,
        genero: formData.genero || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
      };

      await register(userData);
      
      Alert.alert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada exitosamente. ¡Bienvenido a VoluntariosGT!',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error en registro:', err);
    }
  };

  // Navegar a login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // Renderizar indicador de progreso
  const renderProgressIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: STYLE_CONFIG.spacing.lg }}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={{
            width: 30,
            height: 4,
            backgroundColor: index + 1 <= currentStep ? COLORS.primary : COLORS.gray[300],
            marginHorizontal: 4,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );

  // Renderizar paso 1: Información básica
  const renderStep1 = () => (
    <View>
      <Text style={{
        fontSize: STYLE_CONFIG.fontSize.xl,
        fontWeight: STYLE_CONFIG.fontWeight.semibold,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: STYLE_CONFIG.spacing.lg,
      }}>
        Información Básica
      </Text>

      <Input
        label="Nombre Completo *"
        placeholder="Ingresa tu nombre completo"
        value={formData.nombre_completo}
        onChangeText={(value) => handleInputChange('nombre_completo', value)}
        error={formErrors.nombre_completo}
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>👤</Text>}
      />

      <Input
        label="Correo Electrónico *"
        placeholder="ejemplo@correo.com"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        error={formErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>📧</Text>}
      />

      <View style={{ marginBottom: STYLE_CONFIG.spacing.md }}>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          fontWeight: STYLE_CONFIG.fontWeight.medium,
          color: COLORS.textPrimary,
          marginBottom: STYLE_CONFIG.spacing.xs,
        }}>
          Tipo de Usuario *
        </Text>
        
        <View style={{
          borderWidth: 1,
          borderColor: formErrors.rol ? COLORS.error : COLORS.border,
          borderRadius: STYLE_CONFIG.borderRadius.lg,
          backgroundColor: COLORS.white,
        }}>
          <Picker
            selectedValue={formData.rol}
            onValueChange={(value) => handleInputChange('rol', value)}
            style={{ height: 50 }}
          >
            <Picker.Item label="Selecciona tu rol..." value="" />
            <Picker.Item label="🙋‍♂️ Voluntario - Quiero ayudar" value="voluntario" />
            <Picker.Item label="🤲 Beneficiario - Necesito ayuda" value="beneficiario" />
            <Picker.Item label="🏢 Entidad - Organizo actividades" value="entidad" />
          </Picker>
        </View>
        
        {formErrors.rol && (
          <Text style={{ color: COLORS.error, fontSize: STYLE_CONFIG.fontSize.sm, marginTop: 4 }}>
            {formErrors.rol}
          </Text>
        )}
      </View>
    </View>
  );

  // Renderizar paso 2: Información adicional
  const renderStep2 = () => (
    <View>
      <Text style={{
        fontSize: STYLE_CONFIG.fontSize.xl,
        fontWeight: STYLE_CONFIG.fontWeight.semibold,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: STYLE_CONFIG.spacing.lg,
      }}>
        Información Adicional
      </Text>

      <Input
        label="Teléfono (Opcional)"
        placeholder="5555-5555 o +502 5555-5555"
        value={formData.telefono}
        onChangeText={(value) => handleInputChange('telefono', value)}
        error={formErrors.telefono}
        keyboardType="phone-pad"
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>📱</Text>}
        helperText="Formato: 5555-5555 o +502 5555-5555"
      />

      <Input
        label="DPI (Opcional)"
        placeholder="1234567890123"
        value={formData.dpi}
        onChangeText={(value) => handleInputChange('dpi', value)}
        error={formErrors.dpi}
        keyboardType="numeric"
        maxLength={13}
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>🆔</Text>}
        helperText="13 dígitos del Documento Personal de Identificación"
      />

      <View style={{ marginBottom: STYLE_CONFIG.spacing.md }}>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          fontWeight: STYLE_CONFIG.fontWeight.medium,
          color: COLORS.textPrimary,
          marginBottom: STYLE_CONFIG.spacing.xs,
        }}>
          Género (Opcional)
        </Text>
        
        <View style={{
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: STYLE_CONFIG.borderRadius.lg,
          backgroundColor: COLORS.white,
        }}>
          <Picker
            selectedValue={formData.genero}
            onValueChange={(value) => handleInputChange('genero', value)}
            style={{ height: 50 }}
          >
            <Picker.Item label="Seleccionar género..." value="" />
            <Picker.Item label="Masculino" value="masculino" />
            <Picker.Item label="Femenino" value="femenino" />
            <Picker.Item label="Otro" value="otro" />
            <Picker.Item label="Prefiero no decir" value="no_especifica" />
          </Picker>
        </View>
      </View>

      <Text style={{
        fontSize: STYLE_CONFIG.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        Esta información nos ayuda a personalizar tu experiencia
      </Text>
    </View>
  );

  // Renderizar paso 3: Contraseña
  const renderStep3 = () => (
    <View>
      <Text style={{
        fontSize: STYLE_CONFIG.fontSize.xl,
        fontWeight: STYLE_CONFIG.fontWeight.semibold,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: STYLE_CONFIG.spacing.lg,
      }}>
        Crear Contraseña
      </Text>

      <Input
        label="Contraseña *"
        placeholder="Crea una contraseña segura"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        error={formErrors.password}
        secureTextEntry={true}
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>🔒</Text>}
        helperText="Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números"
      />

      <Input
        label="Confirmar Contraseña *"
        placeholder="Confirma tu contraseña"
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        error={formErrors.confirmPassword}
        secureTextEntry={true}
        leftIcon={<Text style={{ color: COLORS.textSecondary }}>🔒</Text>}
      />

      <View style={{
        backgroundColor: COLORS.backgroundSecondary,
        padding: STYLE_CONFIG.spacing.md,
        borderRadius: STYLE_CONFIG.borderRadius.lg,
        marginTop: STYLE_CONFIG.spacing.md,
      }}>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          color: COLORS.textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        }}>
          Al registrarte, aceptas nuestros{' '}
          <Text style={{ color: COLORS.primary }}>Términos de Servicio</Text>
          {' '}y{' '}
          <Text style={{ color: COLORS.primary }}>Política de Privacidad</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: STYLE_CONFIG.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: STYLE_CONFIG.spacing.xl }}>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize['2xl'],
              fontWeight: STYLE_CONFIG.fontWeight.bold,
              color: COLORS.primary,
              marginBottom: STYLE_CONFIG.spacing.sm,
            }}>
              Crear Cuenta
            </Text>
            
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.base,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}>
              Únete a la comunidad de voluntarios de Guatemala
            </Text>
          </View>

          {/* Indicador de progreso */}
          {renderProgressIndicator()}

          {/* Error general */}
          {error && (
            <View style={{
              backgroundColor: COLORS.error + '10',
              borderColor: COLORS.error,
              borderWidth: 1,
              borderRadius: STYLE_CONFIG.borderRadius.lg,
              padding: STYLE_CONFIG.spacing.md,
              marginBottom: STYLE_CONFIG.spacing.md,
            }}>
              <Text style={{ color: COLORS.error, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          )}

          {/* Contenido del paso actual */}
          <View style={{ flex: 1, marginBottom: STYLE_CONFIG.spacing.xl }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>

          {/* Botones de navegación */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {currentStep > 1 && (
              <Button
                title="Anterior"
                onPress={prevStep}
                variant="outline"
                disabled={isLoading}
                style={{ flex: 1, marginRight: STYLE_CONFIG.spacing.sm }}
              />
            )}
            
            {currentStep < totalSteps ? (
              <Button
                title="Siguiente"
                onPress={nextStep}
                disabled={isLoading}
                style={{ flex: 1, marginLeft: currentStep > 1 ? STYLE_CONFIG.spacing.sm : 0 }}
              />
            ) : (
              <Button
                title="Crear Cuenta"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={{ flex: 1, marginLeft: STYLE_CONFIG.spacing.sm }}
              />
            )}
          </View>

          {/* Link a login */}
          <View style={{ alignItems: 'center', marginTop: STYLE_CONFIG.spacing.lg }}>
            <Button
              title="¿Ya tienes cuenta? Inicia sesión"
              onPress={navigateToLogin}
              variant="ghost"
              disabled={isLoading}
            />
          </View>
        </ScrollView>

        {/* Loading overlay */}
        {isLoading && (
          <LoadingSpinner
            fullScreen
            text="Creando cuenta..."
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

