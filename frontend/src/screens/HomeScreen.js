import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { COLORS, STYLE_CONFIG } from '../constants/config';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, getUserDisplayInfo, getRoleInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    actividades_disponibles: 0,
    mis_inscripciones: 0,
    horas_completadas: 0,
    certificados: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const userInfo = getUserDisplayInfo();
  const roleInfo = getRoleInfo();

  // Cargar datos iniciales
  useEffect(() => {
    loadHomeData();
  }, []);

  // Cargar datos del dashboard
  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar estadísticas según el rol
      if (roleInfo?.permissions.includes('view_activities') || roleInfo?.permissions.includes('all')) {
        await Promise.all([
          loadUserStats(),
          loadRecentActivities(),
        ]);
      }
    } catch (error) {
      console.error('Error al cargar datos del home:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas del usuario
  const loadUserStats = async () => {
    try {
      if (user?.rol === 'voluntario' || user?.rol === 'beneficiario') {
        const response = await apiClient.get('/usuarios/estadisticas');
        setStats(response.estadisticas || stats);
      } else if (user?.rol === 'entidad') {
        const response = await apiClient.get('/reportes/actividades?limite=1');
        setStats({
          actividades_creadas: response.reporte?.total_actividades || 0,
          total_inscripciones: response.reporte?.total_inscripciones || 0,
          horas_planificadas: response.reporte?.total_horas_planificadas || 0,
          actividades_completadas: response.reporte?.actividades_por_estado?.completada || 0,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Cargar actividades recientes
  const loadRecentActivities = async () => {
    try {
      const response = await apiClient.get('/actividades?limite=3&estado=abierta');
      setRecentActivities(response.actividades || []);
    } catch (error) {
      console.error('Error al cargar actividades recientes:', error);
    }
  };

  // Manejar refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHomeData();
    setIsRefreshing(false);
  };

  // Renderizar tarjeta de estadística
  const renderStatCard = (title, value, icon, color = COLORS.primary) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: STYLE_CONFIG.borderRadius.lg,
        padding: STYLE_CONFIG.spacing.md,
        marginHorizontal: STYLE_CONFIG.spacing.xs,
        minWidth: (width - 60) / 2,
        alignItems: 'center',
        ...STYLE_CONFIG.shadows.sm,
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: STYLE_CONFIG.spacing.xs }}>
        {icon}
      </Text>
      <Text
        style={{
          fontSize: STYLE_CONFIG.fontSize['2xl'],
          fontWeight: STYLE_CONFIG.fontWeight.bold,
          color: color,
          marginBottom: STYLE_CONFIG.spacing.xs,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );

  // Renderizar tarjeta de actividad
  const renderActivityCard = (activity) => (
    <TouchableOpacity
      key={activity.id}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: STYLE_CONFIG.borderRadius.lg,
        padding: STYLE_CONFIG.spacing.md,
        marginBottom: STYLE_CONFIG.spacing.md,
        ...STYLE_CONFIG.shadows.sm,
      }}
      onPress={() => navigation.navigate('Activities', { activityId: activity.id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.lg,
              fontWeight: STYLE_CONFIG.fontWeight.semibold,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.xs,
            }}
          >
            {activity.titulo}
          </Text>
          
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.sm,
              color: COLORS.textSecondary,
              marginBottom: STYLE_CONFIG.spacing.sm,
            }}
          >
            {activity.entidades?.nombre_organizacion}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 4 }}>📅</Text>
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.sm,
                color: COLORS.textSecondary,
              }}
            >
              {new Date(activity.fecha_inicio).toLocaleDateString('es-GT')}
            </Text>
          </View>
        </View>
        
        <View
          style={{
            backgroundColor: COLORS.primary + '20',
            paddingHorizontal: STYLE_CONFIG.spacing.sm,
            paddingVertical: STYLE_CONFIG.spacing.xs,
            borderRadius: STYLE_CONFIG.borderRadius.md,
          }}
        >
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.xs,
              color: COLORS.primary,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}
          >
            {activity.categoria}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Cargando dashboard..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      <ScrollView
        contentContainerStyle={{ padding: STYLE_CONFIG.spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header de bienvenida */}
        <View style={{ marginBottom: STYLE_CONFIG.spacing.xl }}>
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize['2xl'],
              fontWeight: STYLE_CONFIG.fontWeight.bold,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.xs,
            }}
          >
            ¡Hola, {userInfo?.name?.split(' ')[0]}! 👋
          </Text>
          
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.base,
              color: COLORS.textSecondary,
            }}
          >
            {roleInfo?.description}
          </Text>
          
          {!userInfo?.verified && (
            <View
              style={{
                backgroundColor: COLORS.warning + '20',
                borderColor: COLORS.warning,
                borderWidth: 1,
                borderRadius: STYLE_CONFIG.borderRadius.lg,
                padding: STYLE_CONFIG.spacing.md,
                marginTop: STYLE_CONFIG.spacing.md,
              }}
            >
              <Text
                style={{
                  color: COLORS.warning,
                  fontSize: STYLE_CONFIG.fontSize.sm,
                  textAlign: 'center',
                }}
              >
                ⚠️ Tu cuenta aún no está verificada. Completa tu perfil para acceder a todas las funciones.
              </Text>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={{ marginBottom: STYLE_CONFIG.spacing.xl }}>
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.xl,
              fontWeight: STYLE_CONFIG.fontWeight.semibold,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.lg,
            }}
          >
            Resumen
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: STYLE_CONFIG.spacing.xs }}
          >
            {user?.rol === 'voluntario' && (
              <>
                {renderStatCard('Actividades\nDisponibles', stats.actividades_disponibles, '📋')}
                {renderStatCard('Mis\nInscripciones', stats.mis_inscripciones, '✅', COLORS.success)}
                {renderStatCard('Horas\nCompletadas', stats.horas_completadas, '⏰', COLORS.warning)}
                {renderStatCard('Certificados\nObtenidos', stats.certificados, '🏆', COLORS.secondary)}
              </>
            )}
            
            {user?.rol === 'beneficiario' && (
              <>
                {renderStatCard('Actividades\nDisponibles', stats.actividades_disponibles, '📋')}
                {renderStatCard('Mis\nSolicitudes', stats.mis_inscripciones, '🤲', COLORS.beneficiary)}
                {renderStatCard('Horas de\nAyuda Recibida', stats.horas_completadas, '💝', COLORS.success)}
              </>
            )}
            
            {user?.rol === 'entidad' && (
              <>
                {renderStatCard('Actividades\nCreadas', stats.actividades_creadas, '📝')}
                {renderStatCard('Total\nInscripciones', stats.total_inscripciones, '👥', COLORS.success)}
                {renderStatCard('Horas\nPlanificadas', stats.horas_planificadas, '⏰', COLORS.warning)}
                {renderStatCard('Actividades\nCompletadas', stats.actividades_completadas, '✅', COLORS.entity)}
              </>
            )}
          </ScrollView>
        </View>

        {/* Acciones rápidas */}
        <View style={{ marginBottom: STYLE_CONFIG.spacing.xl }}>
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.xl,
              fontWeight: STYLE_CONFIG.fontWeight.semibold,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.lg,
            }}
          >
            Acciones Rápidas
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(user?.rol === 'voluntario' || user?.rol === 'beneficiario') && (
              <Button
                title="Ver Actividades"
                onPress={() => navigation.navigate('Activities')}
                style={{ width: '48%', marginBottom: STYLE_CONFIG.spacing.md }}
                icon={<Text style={{ color: COLORS.white }}>📋</Text>}
              />
            )}
            
            <Button
              title="Explorar Mapa"
              onPress={() => navigation.navigate('Map')}
              variant="secondary"
              style={{ width: '48%', marginBottom: STYLE_CONFIG.spacing.md }}
              icon={<Text style={{ color: COLORS.primary }}>🗺️</Text>}
            />
            
            {user?.rol === 'entidad' && (
              <Button
                title="Crear Actividad"
                onPress={() => navigation.navigate('Activities', { action: 'create' })}
                style={{ width: '48%', marginBottom: STYLE_CONFIG.spacing.md }}
                icon={<Text style={{ color: COLORS.white }}>➕</Text>}
              />
            )}
            
            <Button
              title="Mi Perfil"
              onPress={() => navigation.navigate('Profile')}
              variant="outline"
              style={{ width: '48%', marginBottom: STYLE_CONFIG.spacing.md }}
              icon={<Text style={{ color: COLORS.primary }}>👤</Text>}
            />
          </View>
        </View>

        {/* Actividades recientes */}
        {recentActivities.length > 0 && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: STYLE_CONFIG.spacing.lg }}>
              <Text
                style={{
                  fontSize: STYLE_CONFIG.fontSize.xl,
                  fontWeight: STYLE_CONFIG.fontWeight.semibold,
                  color: COLORS.textPrimary,
                }}
              >
                Actividades Recientes
              </Text>
              
              <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
                <Text
                  style={{
                    fontSize: STYLE_CONFIG.fontSize.sm,
                    color: COLORS.primary,
                    fontWeight: STYLE_CONFIG.fontWeight.medium,
                  }}
                >
                  Ver todas →
                </Text>
              </TouchableOpacity>
            </View>
            
            {recentActivities.map(renderActivityCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

