/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} - Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convierte grados a radianes
 * @param {number} degrees - Grados a convertir
 * @returns {number} - Radianes
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Encuentra actividades dentro de un radio específico
 * @param {Array} actividades - Lista de actividades con coordenadas
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLon - Longitud del usuario
 * @param {number} radiusKm - Radio de búsqueda en kilómetros (por defecto 5)
 * @returns {Array} - Actividades ordenadas por distancia
 */
export const findNearbyActivities = (actividades, userLat, userLon, radiusKm = 5) => {
  return actividades
    .map(actividad => {
      // Extraer coordenadas de la ubicación (formato PostGIS)
      let lat, lon;
      
      if (actividad.ubicacion && typeof actividad.ubicacion === 'object') {
        if (actividad.ubicacion.coordinates) {
          // Formato GeoJSON: [longitude, latitude]
          lon = actividad.ubicacion.coordinates[0];
          lat = actividad.ubicacion.coordinates[1];
        } else if (actividad.ubicacion.lat && actividad.ubicacion.lon) {
          // Formato objeto simple
          lat = actividad.ubicacion.lat;
          lon = actividad.ubicacion.lon;
        }
      }
      
      if (!lat || !lon) {
        return null; // Saltar actividades sin coordenadas válidas
      }
      
      const distance = calculateDistance(userLat, userLon, lat, lon);
      
      return {
        ...actividad,
        distancia_km: Math.round(distance * 100) / 100, // Redondear a 2 decimales
        ubicacion_lat: lat,
        ubicacion_lon: lon
      };
    })
    .filter(actividad => actividad && actividad.distancia_km <= radiusKm)
    .sort((a, b) => a.distancia_km - b.distancia_km);
};

/**
 * Valida si unas coordenadas están dentro de Guatemala
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {boolean} - True si está dentro de Guatemala
 */
export const isWithinGuatemala = (lat, lon) => {
  // Límites aproximados de Guatemala
  const guatemalaBounds = {
    north: 17.8193,
    south: 13.7373,
    east: -88.2256,
    west: -92.2714
  };
  
  return (
    lat >= guatemalaBounds.south &&
    lat <= guatemalaBounds.north &&
    lon >= guatemalaBounds.west &&
    lon <= guatemalaBounds.east
  );
};

/**
 * Obtiene el departamento de Guatemala basado en coordenadas (aproximado)
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {string} - Nombre del departamento
 */
export const getDepartmentByCoordinates = (lat, lon) => {
  // Mapeo aproximado de coordenadas a departamentos
  // Esto es una simplificación, en producción se usaría un servicio de geocodificación
  
  const departments = [
    { name: 'Guatemala', bounds: { n: 14.8, s: 14.4, e: -90.2, w: -90.8 } },
    { name: 'Sacatepéquez', bounds: { n: 14.6, s: 14.4, e: -90.6, w: -90.9 } },
    { name: 'Chimaltenango', bounds: { n: 14.8, s: 14.4, e: -90.6, w: -91.2 } },
    { name: 'Escuintla', bounds: { n: 14.4, s: 13.8, e: -90.6, w: -91.4 } },
    { name: 'Santa Rosa', bounds: { n: 14.4, s: 13.8, e: -90.0, w: -90.6 } },
    { name: 'Sololá', bounds: { n: 14.9, s: 14.4, e: -90.9, w: -91.4 } },
    { name: 'Totonicapán', bounds: { n: 15.1, s: 14.7, e: -91.2, w: -91.6 } },
    { name: 'Quetzaltenango', bounds: { n: 15.1, s: 14.6, e: -91.4, w: -91.9 } },
    { name: 'Suchitepéquez', bounds: { n: 14.6, s: 14.0, e: -91.4, w: -91.9 } },
    { name: 'Retalhuleu', bounds: { n: 14.6, s: 14.2, e: -91.6, w: -92.0 } },
    { name: 'San Marcos', bounds: { n: 15.3, s: 14.6, e: -91.8, w: -92.3 } },
    { name: 'Huehuetenango', bounds: { n: 16.1, s: 15.0, e: -91.2, w: -92.0 } },
    { name: 'Quiché', bounds: { n: 15.8, s: 14.9, e: -90.4, w: -91.2 } },
    { name: 'Baja Verapaz', bounds: { n: 15.5, s: 14.8, e: -89.8, w: -90.4 } },
    { name: 'Alta Verapaz', bounds: { n: 16.2, s: 15.2, e: -89.4, w: -90.4 } },
    { name: 'Petén', bounds: { n: 17.8, s: 15.8, e: -89.0, w: -92.3 } },
    { name: 'Izabal', bounds: { n: 16.0, s: 15.0, e: -88.2, w: -89.4 } },
    { name: 'Zacapa', bounds: { n: 15.2, s: 14.6, e: -89.0, w: -89.8 } },
    { name: 'Chiquimula', bounds: { n: 15.0, s: 14.4, e: -89.0, w: -89.8 } },
    { name: 'Jalapa', bounds: { n: 14.8, s: 14.4, e: -89.6, w: -90.0 } },
    { name: 'Jutiapa', bounds: { n: 14.4, s: 13.8, e: -89.6, w: -90.2 } },
    { name: 'El Progreso', bounds: { n: 15.0, s: 14.6, e: -89.8, w: -90.2 } }
  ];
  
  for (const dept of departments) {
    if (
      lat >= dept.bounds.s &&
      lat <= dept.bounds.n &&
      lon >= dept.bounds.w &&
      lon <= dept.bounds.e
    ) {
      return dept.name;
    }
  }
  
  return 'Desconocido';
};

/**
 * Calcula el punto central de un conjunto de coordenadas
 * @param {Array} coordinates - Array de objetos con lat y lon
 * @returns {Object} - Objeto con lat y lon del centro
 */
export const calculateCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }
  
  let totalLat = 0;
  let totalLon = 0;
  
  coordinates.forEach(coord => {
    totalLat += coord.lat;
    totalLon += coord.lon;
  });
  
  return {
    lat: totalLat / coordinates.length,
    lon: totalLon / coordinates.length
  };
};

/**
 * Genera un bounding box alrededor de un punto
 * @param {number} lat - Latitud central
 * @param {number} lon - Longitud central
 * @param {number} radiusKm - Radio en kilómetros
 * @returns {Object} - Objeto con coordenadas del bounding box
 */
export const generateBoundingBox = (lat, lon, radiusKm) => {
  // Aproximación: 1 grado ≈ 111 km
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat)));
  
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lon + lonDelta,
    west: lon - lonDelta
  };
};

/**
 * Formatea coordenadas para mostrar al usuario
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {string} - Coordenadas formateadas
 */
export const formatCoordinates = (lat, lon) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
};

/**
 * Convierte coordenadas a formato PostGIS POINT
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {string} - String en formato PostGIS
 */
export const toPostGISPoint = (lat, lon) => {
  return `POINT(${lon} ${lat})`;
};

/**
 * Extrae coordenadas de un string PostGIS POINT
 * @param {string} pointString - String en formato PostGIS
 * @returns {Object} - Objeto con lat y lon
 */
export const fromPostGISPoint = (pointString) => {
  if (!pointString) return null;
  
  const match = pointString.match(/POINT\(([^)]+)\)/);
  if (!match) return null;
  
  const [lon, lat] = match[1].split(' ').map(Number);
  return { lat, lon };
};

export default {
  calculateDistance,
  findNearbyActivities,
  isWithinGuatemala,
  getDepartmentByCoordinates,
  calculateCenter,
  generateBoundingBox,
  formatCoordinates,
  toPostGISPoint,
  fromPostGISPoint
};

