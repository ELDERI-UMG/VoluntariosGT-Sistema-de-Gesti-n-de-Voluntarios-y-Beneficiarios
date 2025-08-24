import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { activitiesService } from '../services/activities';
import { locationService } from '../services/location';
import ActivityCard from '../components/ActivityCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS } from '../constants/colors';
import { STYLE_CONFIG } from '../constants/config';

const ActivitiesScreen = ({ navigation, route }) => {
  const { user, hasRole } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    categoria: '',
    estado: 'abierta',
    busqueda: '',
    radio: 10,
    page: 1,
    limite: 10,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar ubicación del usuario
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Recargar actividades cuando cambien los filtros
  useEffect(() => {
    if (filters.page === 1) {
      loadActivities(true);
    }
  }, [filters]);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadActivities(true),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar ubicación del usuario
  const loadUserLocation = async () => {
    try {
      const location = await locationService.getCurrentLocationOrDefault();
      setUserLocation(location);
      
      // Actualizar filtros con ubicación
      setFilters(prev => ({
        ...prev,
        latitud: location.latitude,
        longitud: location.longitude,
      }));
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  };

  // Cargar actividades
  const loadActivities = async (reset = false) => {
    try {
      if (reset) {
        setActivities([]);
        setHasMoreData(true);
      }

      const currentFilters = reset ? { ...filters, page: 1 } : filters;
      const response = await activitiesService.getActivities(currentFilters);
      
      const newActivities = response.actividades || [];
      
      if (reset) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
      
      // Verificar si hay más datos
      setHasMoreData(newActivities.length === filters.limite);
      
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades.');
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const cats = await activitiesService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Manejar refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setFilters(prev => ({ ...prev, page: 1 }));
    await loadActivities(true);
    setIsRefreshing(false);
  }, []);

  // Cargar más actividades (paginación)
  const loadMoreActivities = async () => {
    if (isLoadingMore || !hasMoreData) return;
    
    setIsLoadingMore(true);
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    await loadActivities(false);
    setIsLoadingMore(false);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Resetear página al cambiar filtros
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      categoria: '',
      estado: 'abierta',
      busqueda: '',
      radio: 10,
      page: 1,
      limite: 10,
      latitud: userLocation?.latitude,
      longitud: userLocation?.longitude,
    });
  };

  // Navegar a detalle de actividad
  const navigateToActivityDetail = (activity) => {
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  // Navegar a crear actividad (solo entidades)
  const navigateToCreateActivity = () => {
    navigation.navigate('CreateActivity');
  };

  // Renderizar header con búsqueda y filtros
  const renderHeader = () => (
    <View style={{
      backgroundColor: COLORS.white,
      padding: STYLE_CONFIG.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    }}>
      {/* Título */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: STYLE_CONFIG.spacing.md,
      }}>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize['2xl'],
          fontWeight: STYLE_CONFIG.fontWeight.bold,
          color: COLORS.textPrimary,
        }}>
          Actividades
        </Text>
        
        {hasRole('entidad') && (
          <TouchableOpacity
            onPress={navigateToCreateActivity}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: STYLE_CONFIG.spacing.md,
              paddingVertical: STYLE_CONFIG.spacing.sm,
              borderRadius: STYLE_CONFIG.borderRadius.lg,
            }}
          >
            <Text style={{
              color: COLORS.white,
              fontSize: STYLE_CONFIG.fontSize.sm,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}>
              + Crear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de búsqueda */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: STYLE_CONFIG.borderRadius.lg,
        paddingHorizontal: STYLE_CONFIG.spacing.md,
        marginBottom: STYLE_CONFIG.spacing.md,
      }}>
        <Text style={{ fontSize: 16, marginRight: 8, color: COLORS.textSecondary }}>🔍</Text>
        <TextInput
          style={{
            flex: 1,
            paddingVertical: STYLE_CONFIG.spacing.sm,
            fontSize: STYLE_CONFIG.fontSize.base,
            color: COLORS.textPrimary,
          }}
          placeholder="Buscar actividades..."
          placeholderTextColor={COLORS.textSecondary}
          value={filters.busqueda}
          onChangeText={(text) => handleFilterChange('busqueda', text)}
        />
      </View>

      {/* Botones de filtros */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.backgroundSecondary,
            paddingHorizontal: STYLE_CONFIG.spacing.md,
            paddingVertical: STYLE_CONFIG.spacing.sm,
            borderRadius: STYLE_CONFIG.borderRadius.lg,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 4 }}>⚙️</Text>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textPrimary,
            fontWeight: STYLE_CONFIG.fontWeight.medium,
          }}>
            Filtros
          </Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          color: COLORS.textSecondary,
        }}>
          {activities.length} actividades encontradas
        </Text>
      </View>
    </View>
  );

  // Renderizar modal de filtros
  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: STYLE_CONFIG.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xl,
            fontWeight: STYLE_CONFIG.fontWeight.semibold,
            color: COLORS.textPrimary,
          }}>
            Filtros
          </Text>
          
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.lg,
              color: COLORS.primary,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}>
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: STYLE_CONFIG.spacing.lg }}>
          {/* Categoría */}
          <View style={{ marginBottom: STYLE_CONFIG.spacing.lg }}>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.base,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.sm,
            }}>
              Categoría
            </Text>
            <View style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: STYLE_CONFIG.borderRadius.lg,
              backgroundColor: COLORS.white,
            }}>
              <Picker
                selectedValue={filters.categoria}
                onValueChange={(value) => handleFilterChange('categoria', value)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Todas las categorías" value="" />
                {categories.map(category => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Estado */}
          <View style={{ marginBottom: STYLE_CONFIG.spacing.lg }}>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.base,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
              color: COLORS.textPrimary,
              marginBottom: STYLE_CONFIG.spacing.sm,
            }}>
              Estado
            </Text>
            <View style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: STYLE_CONFIG.borderRadius.lg,
              backgroundColor: COLORS.white,
            }}>
              <Picker
                selectedValue={filters.estado}
                onValueChange={(value) => handleFilterChange('estado', value)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Todas" value="" />
                <Picker.Item label="Abiertas" value="abierta" />
                <Picker.Item label="Cerradas" value="cerrada" />
                <Picker.Item label="Completadas" value="completada" />
              </Picker>
            </View>
          </View>

          {/* Radio de búsqueda */}
          {userLocation && (
            <View style={{ marginBottom: STYLE_CONFIG.spacing.lg }}>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.base,
                fontWeight: STYLE_CONFIG.fontWeight.medium,
                color: COLORS.textPrimary,
                marginBottom: STYLE_CONFIG.spacing.sm,
              }}>
                Radio de búsqueda: {filters.radio} km
              </Text>
              <View style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: STYLE_CONFIG.borderRadius.lg,
                backgroundColor: COLORS.white,
              }}>
                <Picker
                  selectedValue={filters.radio}
                  onValueChange={(value) => handleFilterChange('radio', value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="1 km" value={1} />
                  <Picker.Item label="5 km" value={5} />
                  <Picker.Item label="10 km" value={10} />
                  <Picker.Item label="25 km" value={25} />
                  <Picker.Item label="50 km" value={50} />
                  <Picker.Item label="Todo Guatemala" value={1000} />
                </Picker>
              </View>
            </View>
          )}

          {/* Botones */}
          <View style={{ marginTop: STYLE_CONFIG.spacing.xl }}>
            <Button
              title="Limpiar Filtros"
              onPress={clearFilters}
              variant="outline"
              fullWidth
              style={{ marginBottom: STYLE_CONFIG.spacing.md }}
            />
            
            <Button
              title="Aplicar Filtros"
              onPress={() => setShowFilters(false)}
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Renderizar elemento de actividad
  const renderActivityItem = ({ item }) => (
    <ActivityCard
      activity={item}
      onPress={navigateToActivityDetail}
      showDistance={!!userLocation}
      userLocation={userLocation}
      style={{ marginHorizontal: STYLE_CONFIG.spacing.lg }}
    />
  );

  // Renderizar footer de carga
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={{ padding: STYLE_CONFIG.spacing.lg }}>
        <LoadingSpinner text="Cargando más actividades..." />
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Cargando actividades..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      {renderHeader()}
      
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMoreActivities}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: STYLE_CONFIG.spacing.xl,
          }}>
            <Text style={{ fontSize: 48, marginBottom: STYLE_CONFIG.spacing.lg }}>
              📋
            </Text>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.xl,
              fontWeight: STYLE_CONFIG.fontWeight.semibold,
              color: COLORS.textPrimary,
              textAlign: 'center',
              marginBottom: STYLE_CONFIG.spacing.md,
            }}>
              No hay actividades disponibles
            </Text>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.base,
              color: COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: STYLE_CONFIG.spacing.lg,
            }}>
              Intenta ajustar los filtros o crear una nueva actividad
            </Text>
            
            {hasRole('entidad') && (
              <Button
                title="Crear Actividad"
                onPress={navigateToCreateActivity}
                icon={<Text style={{ color: COLORS.white }}>➕</Text>}
              />
            )}
          </View>
        }
        contentContainerStyle={
          activities.length === 0 ? { flex: 1 } : { paddingBottom: STYLE_CONFIG.spacing.lg }
        }
      />

      {renderFiltersModal()}
    </SafeAreaView>
  );
};

export default ActivitiesScreen;

