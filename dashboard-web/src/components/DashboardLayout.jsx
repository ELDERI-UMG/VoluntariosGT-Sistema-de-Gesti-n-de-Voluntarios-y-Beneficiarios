import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const { user, logout, getUserDisplayInfo, getRoleInfo, hasAnyRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
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

  // Verificar si la ruta está activa
  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">VoluntariosGT</span>
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
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">VoluntariosGT</span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Información del usuario */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userInfo?.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userInfo?.name}
                </p>
                <Badge variant="secondary" className="text-xs">
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
        <header className="bg-white shadow-sm border-b">
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

            {/* Título de la página */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900">
                Dashboard Administrativo
              </h1>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Menú de usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userInfo?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
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
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

