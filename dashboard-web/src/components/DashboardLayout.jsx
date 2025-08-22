import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'entidad'] },
  { name: 'Actividades', href: '/activities', icon: Calendar, roles: ['admin', 'entidad'] },
  { name: 'Usuarios', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['admin', 'entidad'] },
  { name: 'Certificados', href: '/certificates', icon: BarChart3, roles: ['admin', 'entidad'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['admin', 'entidad'] },
];

export const DashboardLayout = ({ children }) => {
  const { logout, getUserDisplayInfo, getRoleInfo, hasAnyRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    console.log('Sidebar state changed:', sidebarOpen);
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);
  
  const userInfo = getUserDisplayInfo();
  const roleInfo = getRoleInfo();

  // Filtrar navegación según permisos del usuario
  const filteredNavigation = navigation.filter(item => 
    hasAnyRole(item.roles)
  );

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Manejar navegación a configuración
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Verificar si la ruta está activa
  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar móvil profesional */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay premium */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)} 
          />
          
          {/* Sidebar content premium */}
          <div className="relative w-72 h-full turquoise-sidebar shadow-2xl overflow-y-auto border-r border-turquoise-400 border-opacity-30">
            {/* Header premium */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-turquoise-400 border-opacity-30">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-turquoise-100" />
                <span className="text-base font-medium text-turquoise-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>VoluntariosGT</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-turquoise-200 hover:text-white hover:bg-turquoise-700 p-1.5 rounded-lg transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Navigation premium */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-turquoise-700 text-white shadow-md font-medium'
                      : 'text-turquoise-100 hover:bg-turquoise-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{item.name}</span>
                  {isActiveRoute(item.href) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-turquoise-200 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* User info premium */}
            <div className="p-4 border-t border-turquoise-400 border-opacity-30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-9 h-9 bg-turquoise-700 rounded-full flex items-center justify-center">
                    <span className="text-turquoise-100 font-semibold text-sm">
                      {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-turquoise-600"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-turquoise-100 font-medium text-sm truncate" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{userInfo?.name}</p>
                  <p className="text-turquoise-300 text-xs truncate">{roleInfo?.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center px-3 py-2 text-turquoise-100 hover:bg-turquoise-700 hover:text-white rounded-lg transition-all duration-200 text-sm"
                  onClick={() => {
                    handleSettingsClick();
                    setSidebarOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  <span className="font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Configuración</span>
                </button>
                <button 
                  className="w-full flex items-center px-3 py-2 text-turquoise-100 hover:bg-turquoise-700 hover:text-white rounded-lg transition-all duration-200 text-sm"
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow turquoise-sidebar border-r border-white/20">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-lg font-medium text-white">VoluntariosGT</span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item-premium flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ripple-effect ${
                  isActiveRoute(item.href)
                    ? 'active bg-white/20 text-white shadow-xl transform scale-105'
                    : 'text-turquoise-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl mr-4 transition-all duration-300 ${
                  isActiveRoute(item.href) ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.name}</span>
                {isActiveRoute(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Información del usuario */}
          <div className="p-6 border-t border-white/20 bg-white/5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-white/30">
                  <AvatarImage src={userInfo?.avatar} />
                  <AvatarFallback className="bg-white text-turquoise-600 font-semibold">
                    {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate mb-1">
                  {userInfo?.name}
                </p>
                <Badge className="bg-white/20 text-white border-white/40 text-xs px-2 py-1 rounded-full">
                  {roleInfo?.name}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header mejorado para móvil */}
        <header className="turquoise-header shadow-sm border-b border-white/10">
          {/* Header móvil */}
          <div className="lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              {/* Botón de menú móvil */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-xl hover:bg-turquoise-100 transition-colors"
                onClick={() => {
                  console.log('Abriendo sidebar móvil');
                  setSidebarOpen(!sidebarOpen);
                }}
              >
                <Menu className="h-5 w-5 text-turquoise-600" />
              </Button>

              {/* Logo móvil */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-turquoise-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-turquoise-600" />
                </div>
                <span className="text-base font-semibold text-gray-800">VoluntariosGT</span>
              </div>

              {/* Avatar móvil */}
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-turquoise-50 p-0">
                <div className="w-7 h-7 bg-turquoise-100 rounded-full flex items-center justify-center">
                  <span className="text-turquoise-700 font-medium text-xs">
                    {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
            </div>
            
            {/* Título móvil separado */}
            <div className="px-4 py-3 bg-turquoise-50 border-b border-turquoise-100">
              <h1 className="text-lg font-semibold text-gray-800 mb-1">Dashboard Administrativo</h1>
              <p className="text-sm text-gray-600">Panel de control principal</p>
            </div>
          </div>

          {/* Header desktop mejorado */}
          <div className="hidden lg:flex h-20 items-center justify-between px-6 lg:px-8">
            {/* Título de la página desktop premium */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-turquoise-100 to-turquoise-200 rounded-2xl shadow-sm">
                  <BarChart3 className="h-6 w-6 text-turquoise-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Dashboard Administrativo
                  </h1>
                  <p className="text-base text-gray-600 mt-0.5" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Panel de control principal • VoluntariosGT</p>
                </div>
              </div>
            </div>

            {/* Acciones del header desktop premium */}
            <div className="flex items-center space-x-6">
              {/* Notificaciones premium */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-turquoise-600 hover:bg-turquoise-50 p-3 rounded-xl transition-all duration-200">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              {/* Separador visual */}
              <div className="w-px h-8 bg-gray-200"></div>

              {/* Usuario premium */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{userInfo?.name}</p>
                  <p className="text-xs text-gray-500">{roleInfo?.name}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-0 rounded-full hover:ring-2 hover:ring-turquoise-200 transition-all duration-200">
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-turquoise-100">
                          <AvatarImage src={userInfo?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-turquoise-100 to-turquoise-200 text-turquoise-700 font-semibold">
                            {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userInfo?.avatar} />
                          <AvatarFallback className="bg-turquoise-100 text-turquoise-700">
                            {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {userInfo?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userInfo?.email}
                          </p>
                          <div className="mt-1">
                            <span className="inline-block bg-turquoise-100 text-turquoise-700 text-xs px-2 py-0.5 rounded-full">
                              {roleInfo?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSettingsClick} className="hover:bg-turquoise-50 hover:text-turquoise-700 p-3">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 p-3">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};