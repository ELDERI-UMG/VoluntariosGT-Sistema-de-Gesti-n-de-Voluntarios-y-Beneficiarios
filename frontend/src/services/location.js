import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  // Solicitar permisos de ubicación
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'La aplicación necesita acceso a tu ubicación para mostrar actividades cercanas. Puedes habilitarlo en la configuración de tu dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Location.openAppSettingsAsync() }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      return false;
    }
  }

  // Verificar si los permisos están concedidos
  async checkLocationPermission() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos de ubicación:', error);
      return false;
    }
  }

  // Obtener ubicación actual
  async getCurrentLocation(options = {}) {
    try {
      const hasPermission = await this.checkLocationPermission();
      
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Permisos de ubicación no concedidos');
        }
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeout: APP_CONFIG.TIMEOUTS.LOCATION_REQUEST,
        maximumAge: 60000, // 1 minuto
      };

      const locationOptions = { ...defaultOptions, ...options };

      const location = await Location.getCurrentPositionAsync(locationOptions);
      
      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      // Guardar ubicación en cache
      await this.saveLocationToCache(this.currentLocation);

      return this.currentLocation;
    } catch (error) {
      console.error('Error al obtener ubicación actual:', error);
      
      // Intentar obtener ubicación desde cache
      const cachedLocation = await this.getLocationFromCache();
      if (cachedLocation) {
        console.log('Usando ubicación desde cache');
        this.currentLocation = cachedLocation;
        return cachedLocation;
      }

      throw error;
    }
  }

  // Iniciar seguimiento de ubicación
  async startLocationTracking(callback, options = {}) {
    try {
      const hasPermission = await this.checkLocationPermission();
      
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Permisos de ubicación no concedidos');
        }
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 segundos
        distanceInterval: 50, // 50 metros
      };

      const trackingOptions = { ...defaultOptions, ...options };

      this.watchId = await Location.watchPositionAsync(
        trackingOptions,
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          // Guardar en cache
          this.saveLocationToCache(this.currentLocation);

          // Llamar callback
          if (callback) {
            callback(this.currentLocation);
          }
        }
      );

      return this.watchId;
    } catch (error) {
      console.error('Error al iniciar seguimiento de ubicación:', error);
      throw error;
    }
  }

  // Detener seguimiento de ubicación
  stopLocationTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Guardar ubicación en cache
  async saveLocationToCache(location) {
    try {
      await AsyncStorage.setItem(
        APP_CONFIG.CACHE.LOCATION_KEY,
        JSON.stringify(location)
      );
    } catch (error) {
      console.error('Error al guardar ubicación en cache:', error);
    }
  }

  // Obtener ubicación desde cache
  async getLocationFromCache() {
    try {
      const cachedLocation = await AsyncStorage.getItem(APP_CONFIG.CACHE.LOCATION_KEY);
      
      if (cachedLocation) {
        const location = JSON.parse(cachedLocation);
        
        // Verificar que la ubicación no sea muy antigua (más de 1 hora)
        const now = Date.now();
        const locationAge = now - location.timestamp;
        const maxAge = 60 * 60 * 1000; // 1 hora
        
        if (locationAge < maxAge) {
          return location;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener ubicación desde cache:', error);
      return null;
    }
  }

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  // Convertir grados a radianes
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Formatear distancia para mostrar
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  }

  // Obtener dirección desde coordenadas (geocodificación inversa)
  async reverseGeocode(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        
        // Formatear dirección para Guatemala
        const parts = [];
        
        if (address.street) parts.push(address.street);
        if (address.streetNumber) parts.push(address.streetNumber);
        if (address.district) parts.push(address.district);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.country) parts.push(address.country);
        
        return parts.join(', ');
      }
      
      return null;
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return null;
    }
  }

  // Obtener coordenadas desde dirección (geocodificación)
  async geocode(address) {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations && locations.length > 0) {
        return {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }

  // Verificar si una ubicación está dentro de Guatemala
  isLocationInGuatemala(latitude, longitude) {
    const bounds = APP_CONFIG.MAPS.GUATEMALA_BOUNDS;
    
    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }

  // Obtener región para el mapa centrada en una ubicación
  getMapRegion(latitude, longitude, radius = 5) {
    // Calcular delta basado en el radio
    const latitudeDelta = radius / 111; // Aproximadamente 111 km por grado de latitud
    const longitudeDelta = radius / (111 * Math.cos(this.toRadians(latitude)));
    
    return {
      latitude,
      longitude,
      latitudeDelta: Math.max(latitudeDelta, 0.01), // Mínimo zoom
      longitudeDelta: Math.max(longitudeDelta, 0.01),
    };
  }

  // Obtener ubicación actual o usar ubicación por defecto de Guatemala
  async getCurrentLocationOrDefault() {
    try {
      const location = await this.getCurrentLocation();
      
      // Verificar si está en Guatemala
      if (this.isLocationInGuatemala(location.latitude, location.longitude)) {
        return location;
      } else {
        console.warn('Ubicación fuera de Guatemala, usando ubicación por defecto');
        return {
          latitude: APP_CONFIG.MAPS.DEFAULT_REGION.latitude,
          longitude: APP_CONFIG.MAPS.DEFAULT_REGION.longitude,
        };
      }
    } catch (error) {
      console.warn('No se pudo obtener ubicación, usando ubicación por defecto');
      return {
        latitude: APP_CONFIG.MAPS.DEFAULT_REGION.latitude,
        longitude: APP_CONFIG.MAPS.DEFAULT_REGION.longitude,
      };
    }
  }

  // Limpiar recursos
  cleanup() {
    this.stopLocationTracking();
    this.currentLocation = null;
  }
}

// Instancia singleton del servicio de ubicación
export const locationService = new LocationService();

export default locationService;

