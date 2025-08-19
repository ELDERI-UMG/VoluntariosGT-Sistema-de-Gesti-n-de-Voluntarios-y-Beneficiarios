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
  const { user, getUserDisplayInfo, getRoleInfo, isAdmin, isEntity } = useAuth();
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
    <div className="p-6 space-y-6">
      {/* Header de bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {userInfo?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {roleInfo?.description} - {formatDate(new Date())}
          </p>
        </div>
        
        {isEntity() && (
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Crear Actividad
          </Button>
        )}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios (solo admin) */}
        {isAdmin() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usuarios.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.usuarios.nuevos_mes} nuevos este mes
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actividades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isEntity() ? 'Mis Actividades' : 'Total Actividades'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actividades.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.actividades.abiertas} abiertas, {stats.actividades.completadas} completadas
            </p>
          </CardContent>
        </Card>

        {/* Inscripciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inscripciones.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.inscripciones.mes_actual} este mes
            </p>
          </CardContent>
        </Card>

        {/* Certificados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificados.emitidos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.certificados.mes_actual} este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividades recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Actividades Recientes</CardTitle>
                <CardDescription>
                  Las últimas actividades {isEntity() ? 'creadas por tu organización' : 'del sistema'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.titulo}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(activity.fecha_inicio)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {activity.direccion_completa?.substring(0, 30)}...
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {activity.cupos_ocupados || 0}/{activity.cupos_totales}
                        </div>
                      </div>
                    </div>
                    <Badge className={getActivityStatusColor(activity.estado)}>
                      {activity.estado}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No hay actividades recientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEntity() && (
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Actividad
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Certificados
              </Button>
              
              {isAdmin() && (
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge className="bg-green-100 text-green-800">Operativo</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última actualización</span>
                <span className="text-sm text-gray-900">{formatDate(new Date())}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Versión</span>
                <span className="text-sm text-gray-900">v1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

