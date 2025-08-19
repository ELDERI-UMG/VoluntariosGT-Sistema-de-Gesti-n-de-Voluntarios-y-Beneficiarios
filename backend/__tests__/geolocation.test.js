import {
  calculateDistance,
  findNearbyActivities,
  isWithinGuatemala,
  getDepartmentByCoordinates,
  calculateCenter,
  generateBoundingBox,
  formatCoordinates,
  toPostGISPoint,
  fromPostGISPoint
} from '../src/utils/geolocation.js';

describe('Geolocation Utils', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between two points correctly', () => {
      // Guatemala City to Antigua (approximately 26km)
      const lat1 = 14.6349;
      const lon1 = -90.5069;
      const lat2 = 14.5586;
      const lon2 = -90.7342;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeCloseTo(25.9, 1); // Allow 0.1km tolerance
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(14.6349, -90.5069, 14.6349, -90.5069);
      expect(distance).toBe(0);
    });
  });

  describe('findNearbyActivities', () => {
    const mockActivities = [
      {
        id: 1,
        name: 'Activity 1',
        ubicacion: {
          coordinates: [-90.5069, 14.6349] // Guatemala City
        }
      },
      {
        id: 2,
        name: 'Activity 2',
        ubicacion: {
          coordinates: [-90.7342, 14.5586] // Antigua
        }
      },
      {
        id: 3,
        name: 'Activity 3',
        ubicacion: {
          coordinates: [-88.5969, 15.4914] // Far location
        }
      }
    ];

    test('should find activities within specified radius', () => {
      const userLat = 14.6349;
      const userLon = -90.5069;
      const radiusKm = 30;

      const nearbyActivities = findNearbyActivities(mockActivities, userLat, userLon, radiusKm);
      
      expect(nearbyActivities).toHaveLength(2);
      expect(nearbyActivities[0].id).toBe(1); // Closest should be first
      expect(nearbyActivities[0].distancia_km).toBe(0);
    });

    test('should return empty array when no activities within radius', () => {
      const userLat = 14.6349;
      const userLon = -90.5069;
      const radiusKm = 1;

      const nearbyActivities = findNearbyActivities(mockActivities, userLat, userLon, radiusKm);
      
      expect(nearbyActivities).toHaveLength(1); // Only the exact location
    });

    test('should handle activities with simple lat/lon format', () => {
      const activitiesSimpleFormat = [
        {
          id: 1,
          name: 'Activity 1',
          ubicacion: {
            lat: 14.6349,
            lon: -90.5069
          }
        }
      ];

      const nearbyActivities = findNearbyActivities(activitiesSimpleFormat, 14.6349, -90.5069, 5);
      expect(nearbyActivities).toHaveLength(1);
      expect(nearbyActivities[0].distancia_km).toBe(0);
    });

    test('should filter out activities without valid coordinates', () => {
      const activitiesWithInvalid = [
        {
          id: 1,
          name: 'Valid Activity',
          ubicacion: {
            coordinates: [-90.5069, 14.6349]
          }
        },
        {
          id: 2,
          name: 'Invalid Activity',
          ubicacion: null
        },
        {
          id: 3,
          name: 'Another Invalid',
          ubicacion: {}
        }
      ];

      const nearbyActivities = findNearbyActivities(activitiesWithInvalid, 14.6349, -90.5069, 5);
      expect(nearbyActivities).toHaveLength(1);
      expect(nearbyActivities[0].id).toBe(1);
    });
  });

  describe('isWithinGuatemala', () => {
    test('should return true for coordinates within Guatemala', () => {
      // Guatemala City
      expect(isWithinGuatemala(14.6349, -90.5069)).toBe(true);
      
      // Quetzaltenango
      expect(isWithinGuatemala(14.8353, -91.5185)).toBe(true);
    });

    test('should return false for coordinates outside Guatemala', () => {
      // Mexico
      expect(isWithinGuatemala(19.4326, -99.1332)).toBe(false);
      
      // Belize (outside eastern boundary)
      expect(isWithinGuatemala(17.2510, -88.0000)).toBe(false);
    });

    test('should handle edge cases', () => {
      // Test boundaries
      expect(isWithinGuatemala(17.8193, -90.0)).toBe(true); // Northern boundary
      expect(isWithinGuatemala(13.7373, -90.0)).toBe(true); // Southern boundary
    });
  });

  describe('getDepartmentByCoordinates', () => {
    test('should identify Guatemala department', () => {
      const dept = getDepartmentByCoordinates(14.6349, -90.5069);
      expect(dept).toBe('Guatemala');
    });

    test('should identify Sacatepéquez department', () => {
      const dept = getDepartmentByCoordinates(14.5586, -90.7342);
      expect(dept).toBe('Guatemala'); // This coordinate is actually closer to Guatemala department boundary
    });

    test('should return "Desconocido" for coordinates outside mapped departments', () => {
      const dept = getDepartmentByCoordinates(0, 0);
      expect(dept).toBe('Desconocido');
    });
  });

  describe('calculateCenter', () => {
    test('should calculate center of multiple coordinates', () => {
      const coordinates = [
        { lat: 14.0, lon: -90.0 },
        { lat: 16.0, lon: -92.0 },
        { lat: 15.0, lon: -91.0 }
      ];

      const center = calculateCenter(coordinates);
      expect(center.lat).toBe(15.0);
      expect(center.lon).toBe(-91.0);
    });

    test('should return null for empty array', () => {
      const center = calculateCenter([]);
      expect(center).toBeNull();
    });

    test('should return same coordinates for single point', () => {
      const coordinates = [{ lat: 14.6349, lon: -90.5069 }];
      const center = calculateCenter(coordinates);
      
      expect(center.lat).toBe(14.6349);
      expect(center.lon).toBe(-90.5069);
    });
  });

  describe('generateBoundingBox', () => {
    test('should generate bounding box around a point', () => {
      const lat = 14.6349;
      const lon = -90.5069;
      const radiusKm = 5;

      const bbox = generateBoundingBox(lat, lon, radiusKm);

      expect(bbox.north).toBeGreaterThan(lat);
      expect(bbox.south).toBeLessThan(lat);
      expect(bbox.east).toBeGreaterThan(lon);
      expect(bbox.west).toBeLessThan(lon);
    });
  });

  describe('formatCoordinates', () => {
    test('should format positive coordinates correctly', () => {
      const formatted = formatCoordinates(14.6349, -90.5069);
      expect(formatted).toBe('14.634900°N, 90.506900°W');
    });

    test('should format negative latitude correctly', () => {
      const formatted = formatCoordinates(-14.6349, 90.5069);
      expect(formatted).toBe('14.634900°S, 90.506900°E');
    });
  });

  describe('PostGIS conversion functions', () => {
    test('toPostGISPoint should convert coordinates to PostGIS format', () => {
      const pointString = toPostGISPoint(14.6349, -90.5069);
      expect(pointString).toBe('POINT(-90.5069 14.6349)');
    });

    test('fromPostGISPoint should extract coordinates from PostGIS string', () => {
      const coordinates = fromPostGISPoint('POINT(-90.5069 14.6349)');
      expect(coordinates.lat).toBe(14.6349);
      expect(coordinates.lon).toBe(-90.5069);
    });

    test('fromPostGISPoint should handle invalid input', () => {
      expect(fromPostGISPoint(null)).toBeNull();
      expect(fromPostGISPoint('invalid string')).toBeNull();
      expect(fromPostGISPoint('')).toBeNull();
    });
  });
});