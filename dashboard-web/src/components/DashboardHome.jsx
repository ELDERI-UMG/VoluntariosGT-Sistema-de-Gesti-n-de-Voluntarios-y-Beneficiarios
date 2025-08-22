import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  MapPin, 
  Clock,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { apiClient } from '../lib/api.js';

export const DashboardHome = () => {
  const { getUserDisplayInfo, getRoleInfo, isAdmin, isEntity } = useAuth();
  const [stats, setStats] = useState({
    usuarios: { total: 0, nuevos_mes: 0 },
    actividades: { total: 0, abiertas: 0, completadas: 0 },
    inscripciones: { total: 0, mes_actual: 0 },
    certificados: { emitidos: 0, mes_actual: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userInfo = getUserDisplayInfo();
  const roleInfo = getRoleInfo();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar estadísticas según el rol
      if (isAdmin()) {
        await loadAdminStats();
      } else if (isEntity()) {
        await loadEntityStats();
      }
      
      await loadRecentActivities();
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const [usersResponse, activitiesResponse, certificatesResponse] = await Promise.all([
        apiClient.get('/usuarios/estadisticas-admin'),
        apiClient.get('/reportes/actividades'),
        apiClient.get('/certificados/estadisticas')
      ]);

      setStats({
        usuarios: usersResponse.estadisticas || { total: 0, nuevos_mes: 0 },
        actividades: activitiesResponse.reporte || { total: 0, abiertas: 0, completadas: 0 },
        inscripciones: activitiesResponse.inscripciones || { total: 0, mes_actual: 0 },
        certificados: certificatesResponse.estadisticas || { emitidos: 0, mes_actual: 0 }
      });
    } catch (error) {
      console.error('Error al cargar estadísticas de admin:', error);
    }
  };

  const loadEntityStats = async () => {
    try {
      const [activitiesResponse, certificatesResponse] = await Promise.all([
        apiClient.get('/reportes/actividades'),
        apiClient.get('/certificados/estadisticas')
      ]);

      setStats({
        usuarios: { total: 0, nuevos_mes: 0 },
        actividades: activitiesResponse.reporte || { total: 0, abiertas: 0, completadas: 0 },
        inscripciones: activitiesResponse.inscripciones || { total: 0, mes_actual: 0 },
        certificados: certificatesResponse.estadisticas || { emitidos: 0, mes_actual: 0 }
      });
    } catch (error) {
      console.error('Error al cargar estadísticas de entidad:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await apiClient.get('/actividades?limite=5&orden=fecha_creacion');
      setRecentActivities(response.actividades || []);
    } catch (error) {
      console.error('Error al cargar actividades recientes:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌆';
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    const firstName = userInfo?.name?.split(' ')[0];
    
    if (hour < 12) return `Buenos días, ${firstName}`;
    if (hour < 18) return `Buenas tardes, ${firstName}`;
    return `Buenas noches, ${firstName}`;
  };

  const getActivityStatusColor = (status) => {
    const colors = {
      'abierta': 'bg-green-100 text-green-800',
      'cerrada': 'bg-red-100 text-red-800',
      'completada': 'bg-blue-100 text-blue-800',
      'cancelada': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 page-transition">
      {/* Header de bienvenida mejorado */}
      <div className="relative">
        <div className="turquoise-card premium-spacing-sm ambient-light">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreetingMessage()} {getTimeBasedGreeting()}
              </h1>
              <p className="text-gray-600 text-lg font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {roleInfo?.description === 'Administrador del sistema' ? 'Panel de Control Principal' : roleInfo?.description} • {formatDate(new Date())}
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge className="badge-turquoise-outline bg-turquoise-50 text-turquoise-700 border-turquoise-200">
                  {roleInfo?.name}
                </Badge>
                <div className="flex items-center space-x-1 text-sm turquoise-text">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Sistema Operativo</span>
                </div>
              </div>
            </div>
            
            {isEntity() && (
              <div className="mt-6 sm:mt-0">
                <Button className="btn-turquoise ripple-effect magnetic-hover shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Actividad
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios (solo admin) */}
        {isAdmin() && (
          <div className="stats-card dashboard-card-interactive stagger-item soft-glow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="elegant-title">Total Usuarios</p>
                <div className="soft-number">{stats.usuarios.total.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-turquoise-100 rounded-2xl">
                <Users className="h-8 w-8 text-turquoise-600" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">+{stats.usuarios.nuevos_mes}</span>
              </div>
              <span className="text-sm turquoise-text-muted">nuevos este mes</span>
            </div>
          </div>
        )}

        {/* Actividades */}
        <div className="stats-card dashboard-card-interactive stagger-item soft-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="elegant-title">
                {isEntity() ? 'Mis Actividades' : 'Total Actividades'}
              </p>
              <div className="soft-number">{stats.actividades.total.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm turquoise-text">Abiertas</span>
              <Badge className="bg-green-100 text-green-700 text-xs">{stats.actividades.abiertas}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm turquoise-text">Completadas</span>
              <Badge className="bg-blue-100 text-blue-700 text-xs">{stats.actividades.completadas}</Badge>
            </div>
          </div>
        </div>

        {/* Inscripciones */}
        <div className="stats-card dashboard-card-interactive stagger-item soft-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="elegant-title">Inscripciones</p>
              <div className="soft-number">{stats.inscripciones.total.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-600">+{stats.inscripciones.mes_actual}</span>
            </div>
            <span className="text-sm turquoise-text-muted">este mes</span>
          </div>
        </div>

        {/* Certificados */}
        <div className="stats-card dashboard-card-interactive stagger-item soft-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="elegant-title">Certificados</p>
              <div className="soft-number">{stats.certificados.emitidos.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Award className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600">+{stats.certificados.mes_actual}</span>
            </div>
            <span className="text-sm turquoise-text-muted">este mes</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividades recientes mejoradas */}
        <div className="lg:col-span-2 turquoise-card gentle-shimmer">
          <div className="premium-spacing">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Actividades Recientes</h3>
                <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Las últimas actividades {isEntity() ? 'creadas por tu organización' : 'del sistema'}
                </p>
              </div>
              <Button className="btn-turquoise-outline magnetic-hover">
                <Eye className="mr-2 h-4 w-4" />
                Ver todas
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="frosted-glass p-6 rounded-2xl magnetic-hover luminous-border stagger-item"
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-lg mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{activity.titulo}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center space-x-2 text-sm turquoise-text">
                            <div className="p-1.5 bg-turquoise-100 rounded-lg">
                              <Calendar className="h-3 w-3 text-turquoise-600" />
                            </div>
                            <span>{formatDate(activity.fecha_inicio)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm turquoise-text">
                            <div className="p-1.5 bg-turquoise-100 rounded-lg">
                              <MapPin className="h-3 w-3 text-turquoise-600" />
                            </div>
                            <span className="truncate">{activity.direccion_completa?.substring(0, 25)}...</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm turquoise-text">
                            <div className="p-1.5 bg-turquoise-100 rounded-lg">
                              <Users className="h-3 w-3 text-turquoise-600" />
                            </div>
                            <span>{activity.cupos_ocupados || 0}/{activity.cupos_totales}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getActivityStatusColor(activity.estado)} ml-4 px-3 py-1`}>
                        {activity.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 turquoise-text-muted">
                  <div className="p-4 bg-turquoise-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-turquoise-400" />
                  </div>
                  <p className="text-lg">No hay actividades recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Acciones rápidas mejoradas */}
          <div className="turquoise-card premium-spacing-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Acciones Rápidas</h3>
            <div className="space-y-3">
              {isEntity() && (
                <Button className="w-full justify-start btn-turquoise ripple-effect magnetic-hover">
                  <Plus className="mr-3 h-5 w-5" />
                  Crear Actividad
                </Button>
              )}
              
              <Button className="w-full justify-start btn-turquoise-outline magnetic-hover">
                <BarChart3 className="mr-3 h-5 w-5" />
                Ver Reportes
              </Button>
              
              <Button className="w-full justify-start btn-turquoise-outline magnetic-hover">
                <Award className="mr-3 h-5 w-5" />
                Certificados
              </Button>
              
              {isAdmin() && (
                <Button className="w-full justify-start btn-turquoise-outline magnetic-hover">
                  <Users className="mr-3 h-5 w-5" />
                  Gestionar Usuarios
                </Button>
              )}
            </div>
          </div>

          {/* Estado del sistema mejorado */}
          <div className="turquoise-card premium-spacing-sm pulse-glow">
            <h3 className="text-lg font-medium text-gray-800 mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Estado del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Estado</span>
                </div>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">Operativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-turquoise-50 rounded-xl">
                <span className="text-sm turquoise-text">Última actualización</span>
                <span className="text-sm font-medium turquoise-text">{formatDate(new Date())}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm turquoise-text">Versión</span>
                <Badge className="badge-turquoise">v1.0.0</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

