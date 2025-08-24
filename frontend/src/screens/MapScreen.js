import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Button from '../components/Button';
import GradientBackground from '../components/GradientBackground';
import { COLORS } from '../constants/colors';
import { APP_CONFIG, STYLE_CONFIG } from '../constants/config';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  
  const [location, setLocation] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Configuración inicial del mapa (Guatemala)
  const initialRegion = {
    latitude: APP_CONFIG.MAPS.DEFAULT_REGION.latitude,
    longitude: APP_CONFIG.MAPS.DEFAULT_REGION.longitude,
    latitudeDelta: APP_CONFIG.MAPS.DEFAULT_REGION.latitudeDelta,
    longitudeDelta: APP_CONFIG.MAPS.DEFAULT_REGION.longitudeDelta,
  };

  useEffect(() => {
    requestLocationPermission();
    loadActivities();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } else {
        Alert.alert(
          'Permisos de ubicación',
          'Para una mejor experiencia, permite el acceso a tu ubicación.'
        );
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/actividades?estado=abierta&incluir_ubicacion=true');
      const activitiesWithLocation = response.actividades?.filter(
        activity => activity.latitud && activity.longitud
      ) || [];
      setActivities(activitiesWithLocation);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades del mapa');
    } finally {
      setLoading(false);
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const renderActivityDetails = () => {
    if (!selectedActivity) return null;

    return (
      <Card
        shadow="xl"
        style={{
          position: 'absolute',
          bottom: STYLE_CONFIG.spacing.lg,
          left: STYLE_CONFIG.spacing.md,
          right: STYLE_CONFIG.spacing.md,
          maxHeight: height * 0.4,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: STYLE_CONFIG.spacing.md }}>
            <View style={{ flex: 1, marginRight: STYLE_CONFIG.spacing.md }}>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.lg,
                fontWeight: STYLE_CONFIG.fontWeight.bold,
                color: COLORS.textPrimary,
                marginBottom: STYLE_CONFIG.spacing.xs,
              }}>
                {selectedActivity.titulo}
              </Text>
              
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.sm,
                color: COLORS.textSecondary,
                marginBottom: STYLE_CONFIG.spacing.sm,
              }}>
                {selectedActivity.entidades?.nombre_organizacion}
              </Text>
            </View>
            
            <GradientBackground
              colors={COLORS.gradientPrimary}
              style={{
                paddingHorizontal: STYLE_CONFIG.spacing.sm,
                paddingVertical: STYLE_CONFIG.spacing.xs,
                borderRadius: STYLE_CONFIG.borderRadius.full,
              }}
            >
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.xs,
                color: COLORS.white,
                fontWeight: STYLE_CONFIG.fontWeight.bold,
              }}>
                {selectedActivity.categoria}
              </Text>
            </GradientBackground>
          </View>

          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textPrimary,
            marginBottom: STYLE_CONFIG.spacing.md,
            lineHeight: 20,
          }}>
            {selectedActivity.descripcion}
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: STYLE_CONFIG.spacing.md,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginBottom: 4 }}>📅</Text>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.xs,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}>
                {new Date(selectedActivity.fecha_inicio).toLocaleDateString('es-GT')}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginBottom: 4 }}>⏰</Text>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.xs,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}>
                {selectedActivity.duracion_estimada || 'No especificado'}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginBottom: 4 }}>👥</Text>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.xs,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}>
                {selectedActivity.plazas_disponibles} plazas
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: STYLE_CONFIG.spacing.sm }}>
            <Button
              title="Ver Detalles"
              onPress={() => {
                setSelectedActivity(null);
                navigation.navigate('Activities', { activityId: selectedActivity.id });
              }}
              style={{ flex: 1 }}
              size="small"
            />
            
            <Button
              title="Cerrar"
              variant="outline"
              onPress={() => setSelectedActivity(null)}
              style={{ flex: 1 }}
              size="small"
            />
          </View>
        </ScrollView>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando mapa..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
        >
          {activities.map((activity) => (
            <Marker
              key={activity.id}
              coordinate={{
                latitude: parseFloat(activity.latitud),
                longitude: parseFloat(activity.longitud),
              }}
              onPress={() => setSelectedActivity(activity)}
            >
              <View style={{
                backgroundColor: COLORS.primary,
                padding: 8,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: COLORS.white,
                ...STYLE_CONFIG.shadows.md,
              }}>
                <Text style={{ 
                  fontSize: 16, 
                  color: COLORS.white,
                }}>
                  📍
                </Text>
              </View>
              
              <Callout>
                <View style={{ width: 200, padding: 4 }}>
                  <Text style={{
                    fontSize: STYLE_CONFIG.fontSize.sm,
                    fontWeight: STYLE_CONFIG.fontWeight.semibold,
                    marginBottom: 2,
                  }}>
                    {activity.titulo}
                  </Text>
                  <Text style={{
                    fontSize: STYLE_CONFIG.fontSize.xs,
                    color: COLORS.textSecondary,
                  }}>
                    {activity.entidades?.nombre_organizacion}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {location && (
            <Marker
              coordinate={location}
              title="Mi ubicación"
            >
              <View style={{
                backgroundColor: COLORS.info,
                padding: 8,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: COLORS.white,
                ...STYLE_CONFIG.shadows.md,
              }}>
                <Text style={{ fontSize: 12, color: COLORS.white }}>📍</Text>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Controles flotantes */}
        <View style={{
          position: 'absolute',
          top: STYLE_CONFIG.spacing.lg,
          right: STYLE_CONFIG.spacing.md,
          gap: STYLE_CONFIG.spacing.sm,
        }}>
          {location && (
            <TouchableOpacity
              onPress={centerOnUserLocation}
              style={{
                backgroundColor: COLORS.white,
                padding: STYLE_CONFIG.spacing.sm,
                borderRadius: STYLE_CONFIG.borderRadius.full,
                ...STYLE_CONFIG.shadows.md,
              }}
            >
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={loadActivities}
            style={{
              backgroundColor: COLORS.primary,
              padding: STYLE_CONFIG.spacing.sm,
              borderRadius: STYLE_CONFIG.borderRadius.full,
              ...STYLE_CONFIG.shadows.md,
            }}
          >
            <Text style={{ fontSize: 16, color: COLORS.white }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {renderActivityDetails()}
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

