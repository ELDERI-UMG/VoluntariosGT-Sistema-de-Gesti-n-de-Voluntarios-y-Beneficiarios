import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm.jsx';
import { DashboardLayout } from './components/DashboardLayout.jsx';
import { DashboardHome } from './components/DashboardHome.jsx';
import { ActivitiesPage } from './components/ActivitiesPage.jsx';
import { UsersPage } from './components/UsersPage.jsx';
import { ReportsPage } from './components/ReportsPage.jsx';
import { CertificatesPage } from './components/CertificatesPage.jsx';
import { SettingsPage } from './components/SettingsPage.jsx';
import { useAuth } from './hooks/useAuth.js';
import './App.css';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 App: Estado cambió:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  return (
    <Router>
      <Routes>
        {/* Ruta de login - accesible sin autenticación */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
          } 
        />
        
        {/* Rutas protegidas del dashboard */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/activities" element={<ActivitiesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/certificates" element={<CertificatesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* Redirigir rutas no encontradas al dashboard principal */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
