import { useState } from 'react';
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
  Building2,
  Award,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'entidad'] },
  { name: 'Actividades', href: '/activities', icon: Calendar, roles: ['admin', 'entidad'] },
  { name: 'Usuarios', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['admin', 'entidad'] },
  { name: 'Certificados', href: '/certificates', icon: Award, roles: ['admin', 'entidad'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['admin', 'entidad'] },
];

export const DashboardLayout = ({ children }) => {
  const { logout, getUserDisplayInfo, getRoleInfo, hasAnyRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
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
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col turquoise-sidebar shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-white" />
                <span className="text-lg font-medium text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>VoluntariosGT</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item-premium flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                    isActiveRoute(item.href)
                      ? 'active bg-white/20 text-white shadow-lg'
                      : 'text-turquoise-100 hover:bg-white/10'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="p-2 rounded-xl bg-white/10 mr-4">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{item.name}</span>
                </Link>
              ))}
            </nav>
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
              <span className="text-lg font-medium text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>VoluntariosGT</span>
            </div>
          </div>

          {/* Navegación mejorada */}
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
                <span className="font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{item.name}</span>
                {isActiveRoute(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Información del usuario mejorada */}
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
                <p className="text-sm font-medium text-white truncate mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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
        {/* Header */}
        <header className="turquoise-header shadow-sm border-b border-white/10">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Botón de menú móvil */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Título de la página mejorado */}
            <div className="flex-1 lg:flex-none">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-turquoise-100 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-turquoise-600" />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Dashboard Administrativo
                  </h1>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Panel de control principal</p>
                </div>
              </div>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="text-turquoise-600 hover:bg-turquoise-50">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Menú de usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-turquoise-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userInfo?.avatar} />
                      <AvatarFallback className="bg-turquoise-100 text-turquoise-700">
                        {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userInfo?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userInfo?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettingsClick} className="hover:bg-turquoise-50 hover:text-turquoise-700">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-coral-50 hover:text-coral-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

