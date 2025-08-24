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
import Card from '../components/Card';
import GradientBackground from '../components/GradientBackground';
import { COLORS } from '../constants/colors';
import { APP_CONFIG, STYLE_CONFIG } from '../constants/config';
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
      console.log('🔍 Cargando estadísticas para usuario:', user?.email, 'rol:', user?.rol);
      
      if (user?.rol === 'voluntario' || user?.rol === 'beneficiario') {
        console.log('📊 Solicitando estadísticas de voluntario/beneficiario');
        const response = await apiClient.get('/usuarios/estadisticas');
        console.log('✅ Estadísticas recibidas:', response.estadisticas);
        setStats(response.estadisticas || stats);
      } else if (user?.rol === 'entidad') {
        console.log('📊 Solicitando estadísticas de entidad');
        const response = await apiClient.get('/reportes/actividades?limite=1');
        const newStats = {
          actividades_creadas: response.reporte?.total_actividades || 0,
          total_inscripciones: response.reporte?.total_inscripciones || 0,
          horas_planificadas: response.reporte?.total_horas_planificadas || 0,
          actividades_completadas: response.reporte?.actividades_por_estado?.completada || 0,
        };
        console.log('✅ Estadísticas entidad calculadas:', newStats);
        setStats(newStats);
      } else {
        console.log('⚠️ Rol no reconocido o usuario sin rol:', user?.rol);
      }
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      console.error('❌ Detalles del error:', error.message);
      console.error('❌ Status del error:', error.status);
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

  // Renderizar tarjeta de estadística con diseño mejorado
  const renderStatCard = (title, value, icon, color = COLORS.primary) => (
    <GradientBackground
      colors={[COLORS.white, COLORS.backgroundSecondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: STYLE_CONFIG.borderRadius.xl,
        padding: STYLE_CONFIG.spacing.lg,
        marginHorizontal: STYLE_CONFIG.spacing.xs,
        minWidth: (width - 60) / 2,
        alignItems: 'center',
        ...STYLE_CONFIG.shadows.lg,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
      }}
    >
      {/* Icono con fondo circular */}
      <View
        style={{
          backgroundColor: `${color}20`,
          borderRadius: 50,
          width: 64,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: STYLE_CONFIG.spacing.md,
        }}
      >
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>
      
      <Text
        style={{
          fontSize: STYLE_CONFIG.fontSize['3xl'],
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
          fontWeight: STYLE_CONFIG.fontWeight.medium,
        }}
      >
        {title}
      </Text>
    </GradientBackground>
  );

  // Renderizar tarjeta de actividad con diseño premium
  const renderActivityCard = (activity) => (
    <Card
      key={activity.id}
      shadow="lg"
      padding={STYLE_CONFIG.spacing.lg}
      style={{ marginBottom: STYLE_CONFIG.spacing.lg }}
      onPress={() => navigation.navigate('Activities', { activityId: activity.id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          {/* Título con mejor tipografía */}
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.xl,
              fontWeight: STYLE_CONFIG.fontWeight.bold,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.xs,
              lineHeight: 24,
            }}
          >
            {activity.titulo}
          </Text>
          
          {/* Organización con icono */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: STYLE_CONFIG.spacing.sm }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>🏢</Text>
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.sm,
                color: COLORS.textSecondary,
                fontWeight: STYLE_CONFIG.fontWeight.medium,
              }}
            >
              {activity.entidades?.nombre_organizacion}
            </Text>
          </View>
          
          {/* Fecha con mejor diseño */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: COLORS.backgroundSecondary,
            paddingHorizontal: STYLE_CONFIG.spacing.sm,
            paddingVertical: STYLE_CONFIG.spacing.xs,
            borderRadius: STYLE_CONFIG.borderRadius.md,
            alignSelf: 'flex-start',
          }}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>📅</Text>
            <Text
              style={{
                fontSize: STYLE_CONFIG.fontSize.sm,
                color: COLORS.textPrimary,
                fontWeight: STYLE_CONFIG.fontWeight.medium,
              }}
            >
              {new Date(activity.fecha_inicio).toLocaleDateString('es-GT')}
            </Text>
          </View>
        </View>
        
        {/* Categoría con gradiente */}
        <GradientBackground
          colors={COLORS.gradientPrimary}
          style={{
            paddingHorizontal: STYLE_CONFIG.spacing.md,
            paddingVertical: STYLE_CONFIG.spacing.sm,
            borderRadius: STYLE_CONFIG.borderRadius.full,
            ...STYLE_CONFIG.shadows.sm,
          }}
        >
          <Text
            style={{
              fontSize: STYLE_CONFIG.fontSize.xs,
              color: COLORS.white,
              fontWeight: STYLE_CONFIG.fontWeight.bold,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {activity.categoria}
          </Text>
        </GradientBackground>
      </View>
    </Card>
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
        {/* Header de bienvenida con diseño premium */}
        <Card
          shadow="lg"
          style={{
            marginBottom: STYLE_CONFIG.spacing.xl,
            borderWidth: 1,
            borderColor: COLORS.borderLight,
          }}
        >
          {/* Gradiente de fondo sutil */}
          <GradientBackground
            colors={[COLORS.white, COLORS.backgroundSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: STYLE_CONFIG.borderRadius.lg,
              padding: STYLE_CONFIG.spacing.lg,
              marginHorizontal: -STYLE_CONFIG.spacing.md,
              marginVertical: -STYLE_CONFIG.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: STYLE_CONFIG.spacing.md }}>
              <View
                style={{
                  backgroundColor: COLORS.primary + '20',
                  borderRadius: 50,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: STYLE_CONFIG.spacing.md,
                }}
              >
                <Text style={{ fontSize: 28 }}>👋</Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: STYLE_CONFIG.fontSize['3xl'],
                    fontWeight: STYLE_CONFIG.fontWeight.bold,
                    color: COLORS.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  ¡Hola, {userInfo?.name?.split(' ')[0]}!
                </Text>
                
                <Text
                  style={{
                    fontSize: STYLE_CONFIG.fontSize.base,
                    color: COLORS.textSecondary,
                    fontWeight: STYLE_CONFIG.fontWeight.medium,
                  }}
                >
                  {roleInfo?.description}
                </Text>
              </View>
            </View>
            
            {!userInfo?.verified && (
              <Card
                backgroundColor={COLORS.warning + '10'}
                borderRadius={STYLE_CONFIG.borderRadius.lg}
                padding={STYLE_CONFIG.spacing.md}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.warning + '30',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: STYLE_CONFIG.spacing.sm }}>⚠️</Text>
                  <Text
                    style={{
                      color: COLORS.warning,
                      fontSize: STYLE_CONFIG.fontSize.sm,
                      fontWeight: STYLE_CONFIG.fontWeight.medium,
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    Tu cuenta aún no está verificada. Completa tu perfil para acceder a todas las funciones.
                  </Text>
                </View>
              </Card>
            )}
          </GradientBackground>
        </Card>

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

