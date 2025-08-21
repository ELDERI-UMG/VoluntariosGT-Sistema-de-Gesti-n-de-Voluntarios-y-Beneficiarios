import { apiClient } from './api.js';
import { MockDataService } from './mockData.js';

// Servicio que intenta API real, fallback a mock data
export class DataService {
  
  // Obtener estadísticas del dashboard con fallback
  static async getDashboardStats() {
    try {
      console.log('🔄 Intentando cargar datos reales del API...');
      
      // Intentar cargar datos reales con timeout corto
      const response = await Promise.race([
        apiClient.get('/reportes/actividades'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      console.log('✅ Datos reales cargados del API');
      return response;
      
    } catch (error) {
      console.warn('⚠️ API falló, usando datos simulados:', error.message);
      
      // Fallback a datos mock
      return await MockDataService.getGeneralStats();
    }
  }

  // Obtener reporte de actividades
  static async getActivityReport(filters = {}) {
    try {
      console.log('🔄 Cargando reporte de actividades...');
      
      const params = new URLSearchParams(filters).toString();
      const response = await Promise.race([
        apiClient.get(`/reportes/actividades?${params}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      console.log('✅ Reporte real cargado');
      return response;
      
    } catch (error) {
      console.warn('⚠️ Reporte API falló, usando datos simulados');
      return await MockDataService.getActivityReport(filters);
    }
  }

  // Obtener datos para gráficos
  static async getChartData(type = 'actividades') {
    try {
      const response = await Promise.race([
        apiClient.get(`/reportes/charts/${type}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
      
      return response;
      
    } catch (error) {
      console.warn('⚠️ Charts API falló, usando datos simulados');
      return await MockDataService.getChartData(type);
    }
  }

  // Generar y descargar reporte CSV
  static async downloadCSVReport(type = 'actividades') {
    try {
      console.log(`🔄 Generando reporte CSV: ${type}`);
      
      // Intentar endpoint real de exportación
      const response = await Promise.race([
        apiClient.get(`/reportes/exportar-csv?tipo=${type}`, {
          responseType: 'blob'
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      // Descargar archivo real
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${type}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte real descargado' };
      
    } catch (error) {
      console.warn('⚠️ Export API falló, generando archivo local');
      return await MockDataService.generateCSVReport(type);
    }
  }

  // Obtener lista de voluntarios
  static async getVolunteers(page = 1, limit = 10) {
    try {
      const response = await Promise.race([
        apiClient.get(`/usuarios/voluntarios?page=${page}&limit=${limit}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      return response;
      
    } catch (error) {
      console.warn('⚠️ Volunteers API falló, usando datos simulados');
      return await MockDataService.getVolunteers();
    }
  }

  // Crear nueva actividad
  static async createActivity(activityData) {
    try {
      console.log('🔄 Creando nueva actividad...');
      
      const response = await apiClient.post('/actividades', activityData);
      console.log('✅ Actividad creada exitosamente');
      
      return response;
      
    } catch (error) {
      console.error('❌ Error creando actividad:', error);
      
      // Simular éxito para demo
      await MockDataService.delay(500);
      return {
        success: true,
        message: 'Actividad creada (modo demo)',
        id: Math.random().toString(36).substr(2, 9)
      };
    }
  }

  // Obtener datos de certificados
  static async getCertificatesData() {
    try {
      console.log('🔄 Cargando datos de certificados...');
      
      const response = await Promise.race([
        apiClient.get('/certificados/estadisticas'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      console.log('✅ Datos de certificados cargados');
      return response;
      
    } catch (error) {
      console.warn('⚠️ Certificates API falló, usando datos simulados');
      return await MockDataService.getCertificatesData();
    }
  }

  // Generar certificado individual
  static async generateCertificate(data) {
    try {
      console.log('🔄 Generando certificado...');
      
      const response = await apiClient.post('/certificados/generar', data);
      
      console.log('✅ Certificado generado');
      return response;
      
    } catch (error) {
      console.warn('⚠️ Certificate API falló, generando certificado local');
      return await MockDataService.generateCertificate(data);
    }
  }

  // Buscar certificados
  static async searchCertificates(query = '', filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      }).toString();
      
      const response = await Promise.race([
        apiClient.get(`/certificados/buscar?${params}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
      
      return response;
      
    } catch (error) {
      console.warn('⚠️ Search API falló, usando búsqueda local');
      return await MockDataService.searchCertificates(query, filters);
    }
  }

  // Generar lote de certificados
  static async generateBatchCertificates(activityId) {
    try {
      console.log('🔄 Generando lote de certificados...');
      
      const response = await apiClient.post('/certificados/generar-lote', {
        actividad_id: activityId
      });
      
      console.log('✅ Lote de certificados generado');
      return response;
      
    } catch (error) {
      console.warn('⚠️ Batch API falló, simulando generación');
      
      await MockDataService.delay(2000);
      return {
        success: true,
        message: 'Lote de 15 certificados generado exitosamente (modo demo)',
        certificates_generated: 15
      };
    }
  }
}