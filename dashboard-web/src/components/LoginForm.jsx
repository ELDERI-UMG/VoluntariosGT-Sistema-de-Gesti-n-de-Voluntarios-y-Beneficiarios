import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔄 Iniciando login...');
      const result = await login(formData.email, formData.password);
      console.log('✅ Login exitoso:', result);
      // Nota: el estado isAuthenticated se actualiza automáticamente via useAuth
    } catch (error) {
      console.error('❌ Error en login:', error);
      // El error ya se maneja en el hook useAuth
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md turquoise-card soft-glow gentle-shimmer">
        <CardHeader className="premium-spacing text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 soft-glow luminous-border rounded-2xl bg-gradient-to-br from-white to-turquoise-50">
              <Shield className="h-10 w-10 text-turquoise-500" />
            </div>
          </div>
          <CardTitle className="text-3xl turquoise-heading mb-2">
            Dashboard Administrativo
          </CardTitle>
          <CardDescription className="turquoise-text-muted elegant-title">
            Accede al panel de administración de VoluntariosGT
          </CardDescription>
        </CardHeader>
        
        <CardContent className="premium-spacing">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {error && (
              <Alert variant="destructive" className="border-coral-400 bg-gradient-to-r from-coral-400/10 to-coral-500/5">
                <AlertDescription className="text-coral-500">{error}</AlertDescription>
              </Alert>
            )}

            {/* Campo de email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="turquoise-subheading text-sm">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@voluntariosgt.org"
                value={formData.email}
                onChange={handleInputChange}
                className={`turquoise-input elegant-focus ${validationErrors.email ? 'border-coral-400' : ''}`}
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="text-sm text-coral-500 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Campo de contraseña */}
            <div className="space-y-3">
              <Label htmlFor="password" className="turquoise-subheading text-sm">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`turquoise-input elegant-focus pr-12 ${validationErrors.password ? 'border-coral-400' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-turquoise-400 hover:text-turquoise-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-coral-500 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full btn-turquoise ripple-effect magnetic-hover h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="turquoise-text-muted text-sm">
              Solo administradores y entidades autorizadas pueden acceder
            </p>
          </div>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 frosted-glass rounded-xl ambient-light">
            <p className="text-xs turquoise-subheading font-medium mb-3">Credenciales de prueba:</p>
            <div className="text-xs turquoise-text space-y-2">
              <div className="p-2 bg-white/40 rounded-lg">
                <p><span className="font-semibold">Admin:</span> admin@voluntariosgt.org / admin123</p>
              </div>
              <div className="p-2 bg-white/40 rounded-lg">
                <p><span className="font-semibold">Entidad:</span> entidad@ejemplo.org / entidad123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

