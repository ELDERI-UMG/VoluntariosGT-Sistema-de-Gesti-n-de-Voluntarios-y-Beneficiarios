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
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Error en login:', error);
      // El error ya se maneja en el hook useAuth
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Dashboard Administrativo
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ingresa tus credenciales para acceder al panel de administración de VoluntariosGT
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error general */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Campo de email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@voluntariosgt.org"
                value={formData.email}
                onChange={handleInputChange}
                className={validationErrors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Campo de contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={validationErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Solo administradores y entidades autorizadas pueden acceder
            </p>
          </div>

          {/* Credenciales de prueba */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Admin:</strong> admin@voluntariosgt.org / admin123</p>
              <p><strong>Entidad:</strong> entidad@ejemplo.org / entidad123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

