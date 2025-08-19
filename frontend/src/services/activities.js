import { apiClient } from './api';

class ActivitiesService {
  // Obtener lista de actividades
  async getActivities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros a los parámetros de consulta
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/actividades${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      throw error;
    }
  }

  // Obtener actividad por ID
  async getActivityById(activityId) {
    try {
      const response = await apiClient.get(`/actividades/${activityId}`);
      return response.actividad;
    } catch (error) {
      console.error('Error al obtener actividad:', error);
      throw error;
    }
  }

  // Crear nueva actividad (solo entidades)
  async createActivity(activityData) {
    try {
      const response = await apiClient.post('/actividades', activityData);
      return response;
    } catch (error) {
      console.error('Error al crear actividad:', error);
      throw error;
    }
  }

  // Actualizar actividad (solo entidades)
  async updateActivity(activityId, activityData) {
    try {
      const response = await apiClient.put(`/actividades/${activityId}`, activityData);
      return response;
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      throw error;
    }
  }

  // Eliminar actividad (solo entidades)
  async deleteActivity(activityId) {
    try {
      const response = await apiClient.delete(`/actividades/${activityId}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      throw error;
    }
  }

  // Inscribirse en una actividad
  async joinActivity(activityId, additionalData = {}) {
    try {
      const response = await apiClient.post(`/actividades/${activityId}/inscribirse`, additionalData);
      return response;
    } catch (error) {
      console.error('Error al inscribirse en actividad:', error);
      throw error;
    }
  }

  // Obtener mis inscripciones
  async getMyInscriptions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/usuarios/mis-inscripciones${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  }

  // Cancelar inscripción
  async cancelInscription(inscriptionId) {
    try {
      const response = await apiClient.put(`/usuarios/inscripciones/${inscriptionId}/cancelar`);
      return response;
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
      throw error;
    }
  }

  // Subir evidencia de participación
  async uploadEvidence(inscriptionId, evidenceFile, description = '') {
    try {
      const response = await apiClient.uploadFile(
        `/usuarios/inscripciones/${inscriptionId}/evidencia`,
        evidenceFile,
        { descripcion: description }
      );
      return response;
    } catch (error) {
      console.error('Error al subir evidencia:', error);
      throw error;
    }
  }

  // Buscar actividades por ubicación
  async searchActivitiesByLocation(latitude, longitude, radius = 5) {
    try {
      const filters = {
        latitud: latitude,
        longitud: longitude,
        radio: radius,
      };
      
      return await this.getActivities(filters);
    } catch (error) {
      console.error('Error al buscar actividades por ubicación:', error);
      throw error;
    }
  }

  // Obtener categorías disponibles
  async getCategories() {
    try {
      // Las categorías están definidas en el backend, pero podemos obtenerlas dinámicamente
      const response = await apiClient.get('/actividades?limite=1');
      
      // Por ahora, devolvemos las categorías predefinidas
      return [
        'Educación',
        'Salud',
        'Medio Ambiente',
        'Asistencia Social',
        'Deportes y Recreación',
        'Arte y Cultura',
        'Tecnología',
        'Construcción',
        'Alimentación',
        'Emergencias',
        'Otro'
      ];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // Devolver categorías por defecto en caso de error
      return [
        'Educación',
        'Salud',
        'Medio Ambiente',
        'Asistencia Social',
        'Deportes y Recreación',
        'Arte y Cultura',
        'Tecnología',
        'Construcción',
        'Alimentación',
        'Emergencias',
        'Otro'
      ];
    }
  }

  // Obtener estadísticas de actividades del usuario
  async getUserActivityStats() {
    try {
      const response = await apiClient.get('/usuarios/estadisticas');
      return response.estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas de actividades:', error);
      throw error;
    }
  }

  // Validar datos de actividad
  validateActivityData(activityData) {
    const errors = {};

    if (!activityData.titulo || activityData.titulo.trim().length < 5) {
      errors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!activityData.descripcion || activityData.descripcion.trim().length < 20) {
      errors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    if (!activityData.categoria) {
      errors.categoria = 'Selecciona una categoría';
    }

    if (!activityData.fecha_inicio) {
      errors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!activityData.fecha_fin) {
      errors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (activityData.fecha_inicio && activityData.fecha_fin) {
      const startDate = new Date(activityData.fecha_inicio);
      const endDate = new Date(activityData.fecha_fin);
      
      if (startDate >= endDate) {
        errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      if (startDate < new Date()) {
        errors.fecha_inicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    if (!activityData.cupos_totales || activityData.cupos_totales < 1) {
      errors.cupos_totales = 'Debe haber al menos 1 cupo disponible';
    }

    if (activityData.cupos_totales > 1000) {
      errors.cupos_totales = 'El número máximo de cupos es 1000';
    }

    if (!activityData.direccion_completa || activityData.direccion_completa.trim().length < 10) {
      errors.direccion_completa = 'La dirección debe tener al menos 10 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calcular duración de actividad en horas
  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Math.round((end - start) / (1000 * 60 * 60));
  }

  // Verificar si una actividad está disponible para inscripción
  isActivityAvailable(activity) {
    if (!activity) return false;
    
    const now = new Date();
    const startDate = new Date(activity.fecha_inicio);
    
    return (
      activity.estado === 'abierta' &&
      activity.cupos_ocupados < activity.cupos_totales &&
      startDate > now
    );
  }

  // Obtener color según el estado de la actividad
  getActivityStatusColor(status) {
    const colors = {
      'abierta': '#27AE60',
      'cerrada': '#E74C3C',
      'completada': '#8E44AD',
      'cancelada': '#95A5A6',
    };
    
    return colors[status] || '#95A5A6';
  }

  // Obtener texto del estado de la actividad
  getActivityStatusText(status) {
    const texts = {
      'abierta': 'Abierta',
      'cerrada': 'Cerrada',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
    };
    
    return texts[status] || 'Desconocido';
  }

  // Obtener color según el estado de inscripción
  getInscriptionStatusColor(status) {
    const colors = {
      'inscrito': '#3498DB',
      'confirmado': '#F39C12',
      'completado': '#27AE60',
      'cancelado': '#E74C3C',
    };
    
    return colors[status] || '#95A5A6';
  }

  // Obtener texto del estado de inscripción
  getInscriptionStatusText(status) {
    const texts = {
      'inscrito': 'Inscrito',
      'confirmado': 'Confirmado',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
    };
    
    return texts[status] || 'Desconocido';
  }
}

// Instancia singleton del servicio de actividades
export const activitiesService = new ActivitiesService();

export default activitiesService;

