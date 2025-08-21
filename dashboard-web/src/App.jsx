import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm.jsx';
import { DashboardLayout } from './components/DashboardLayout.jsx';
import { DashboardHome } from './components/DashboardHome.jsx';
import { useAuth } from './hooks/useAuth.js';
import './App.css';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 App: Estado cambió:', { isAuthenticated, isLoading });
    console.log('📋 App: Decisión de renderizado:', {
      mostrarLoading: isLoading,
      mostrarLogin: !isAuthenticated && !isLoading,
      mostrarDashboard: isAuthenticated && !isLoading
    });
  }, [isAuthenticated, isLoading]);

  // Simular navegación básica (en una app real usarías React Router)
  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path);
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    console.log('🔄 App: Renderizando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar formulario de login
  if (!isAuthenticated) {
    console.log('🔐 App: Renderizando login form...');
    return <LoginForm />;
  }

  // Si está autenticado, mostrar dashboard
  console.log('🏠 App: Renderizando dashboard...');
  return (
    <DashboardLayout currentPath={currentPath}>
      <DashboardHome />
    </DashboardLayout>
  );
}

export default App;
