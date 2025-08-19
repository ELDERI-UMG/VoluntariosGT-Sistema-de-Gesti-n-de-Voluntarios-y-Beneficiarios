import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { COLORS, STYLE_CONFIG } from '../constants/config';
import { activitiesService } from '../services/activities';
import { locationService } from '../services/location';

const ActivityCard = ({ 
  activity, 
  onPress, 
  showDistance = false, 
  userLocation = null,
  style = {} 
}) => {
  // Calcular distancia si se proporciona ubicación del usuario
  const getDistance = () => {
    if (!showDistance || !userLocation || !activity.ubicacion) {
      return null;
    }

    try {
      // Extraer coordenadas de la ubicación de la actividad (formato POINT)
      const match = activity.ubicacion.match(/POINT\(([^)]+)\)/);
      if (match) {
        const [lon, lat] = match[1].split(' ').map(Number);
        const distance = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lon
        );
        return locationService.formatDistance(distance);
      }
    } catch (error) {
      console.error('Error al calcular distancia:', error);
    }
    
    return null;
  };

  // Obtener color del estado
  const statusColor = activitiesService.getActivityStatusColor(activity.estado);
  const statusText = activitiesService.getActivityStatusText(activity.estado);

  // Verificar si la actividad está disponible
  const isAvailable = activitiesService.isActivityAvailable(activity);

  // Formatear fecha
  const formattedDate = activitiesService.formatDate(activity.fecha_inicio);

  // Calcular duración
  const duration = activitiesService.calculateDuration(activity.fecha_inicio, activity.fecha_fin);

  const distance = getDistance();

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: COLORS.white,
          borderRadius: STYLE_CONFIG.borderRadius.xl,
          padding: STYLE_CONFIG.spacing.lg,
          marginBottom: STYLE_CONFIG.spacing.md,
          ...STYLE_CONFIG.shadows.md,
        },
        style
      ]}
      onPress={() => onPress && onPress(activity)}
      activeOpacity={0.7}
    >
      {/* Header con título y estado */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: STYLE_CONFIG.spacing.md,
      }}>
        <View style={{ flex: 1, marginRight: STYLE_CONFIG.spacing.md }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.lg,
            fontWeight: STYLE_CONFIG.fontWeight.semibold,
            color: COLORS.textPrimary,
            marginBottom: STYLE_CONFIG.spacing.xs,
          }}>
            {activity.titulo}
          </Text>
          
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textSecondary,
          }}>
            {activity.entidades?.nombre_organizacion || 'Organización no especificada'}
          </Text>
        </View>

        <View style={{
          backgroundColor: statusColor + '20',
          paddingHorizontal: STYLE_CONFIG.spacing.sm,
          paddingVertical: STYLE_CONFIG.spacing.xs,
          borderRadius: STYLE_CONFIG.borderRadius.md,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xs,
            color: statusColor,
            fontWeight: STYLE_CONFIG.fontWeight.medium,
          }}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      {activity.descripcion && (
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          color: COLORS.textSecondary,
          lineHeight: 20,
          marginBottom: STYLE_CONFIG.spacing.md,
        }} numberOfLines={2}>
          {activity.descripcion}
        </Text>
      )}

      {/* Información de la actividad */}
      <View style={{ marginBottom: STYLE_CONFIG.spacing.md }}>
        {/* Categoría */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: STYLE_CONFIG.spacing.xs,
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🏷️</Text>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textPrimary,
            fontWeight: STYLE_CONFIG.fontWeight.medium,
          }}>
            {activity.categoria}
          </Text>
        </View>

        {/* Fecha y hora */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: STYLE_CONFIG.spacing.xs,
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>📅</Text>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textSecondary,
          }}>
            {formattedDate}
          </Text>
        </View>

        {/* Duración */}
        {duration > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: STYLE_CONFIG.spacing.xs,
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>⏰</Text>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.sm,
              color: COLORS.textSecondary,
            }}>
              {duration} {duration === 1 ? 'hora' : 'horas'}
            </Text>
          </View>
        )}

        {/* Ubicación */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: distance ? STYLE_CONFIG.spacing.xs : 0,
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>📍</Text>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textSecondary,
            flex: 1,
          }} numberOfLines={1}>
            {activity.direccion_completa || 'Ubicación no especificada'}
          </Text>
        </View>

        {/* Distancia */}
        {distance && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🚶</Text>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.sm,
              color: COLORS.primary,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}>
              A {distance} de distancia
            </Text>
          </View>
        )}
      </View>

      {/* Footer con cupos y disponibilidad */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: STYLE_CONFIG.spacing.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}>
        {/* Cupos disponibles */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>👥</Text>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textSecondary,
          }}>
            {activity.cupos_ocupados || 0}/{activity.cupos_totales || 0} cupos
          </Text>
        </View>

        {/* Indicador de disponibilidad */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isAvailable ? COLORS.success : COLORS.error,
            marginRight: 4,
          }} />
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xs,
            color: isAvailable ? COLORS.success : COLORS.error,
            fontWeight: STYLE_CONFIG.fontWeight.medium,
          }}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActivityCard;

