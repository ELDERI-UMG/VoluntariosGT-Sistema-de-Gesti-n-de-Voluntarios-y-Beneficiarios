// Mock data service - Datos simulados para cuando el backend falla
export class MockDataService {
  
  // Simular delay de API real
  static async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Estadísticas generales del dashboard
  static async getGeneralStats() {
    await this.delay(300);
    
    return {
      usuarios: {
        total_voluntarios: 1247,
        total_beneficiarios: 298,
        total_entidades: 57,
        nuevos_este_mes: 89
      },
      actividades: {
        total_actividades: 156,
        actividades_activas: 12,
        actividades_completadas: 128,
        tasa_completacion: 82.1
      },
      impacto: {
        total_horas_voluntariado: 3456.5,
        total_certificados: 892,
        promedio_calificacion: 4.7,
        personas_beneficiadas: 5234
      }
    };
  }

  // Datos para reportes de actividades
  static async getActivityReport(filters = {}) {
    await this.delay(400);
    
    return {
      total_actividades: 156,
      actividades_por_estado: {
        'planificada': 12,
        'en_progreso': 8,
        'completada': 128,
        'cancelada': 8
      },
      actividades_por_categoria: {
        'educacion': 45,
        'salud': 32,
        'medio_ambiente': 28,
        'social': 34,
        'deportes': 17
      },
      actividades_recientes: [
        {
          id: 1,
          titulo: 'Jornada de Reforestación',
          categoria: 'medio_ambiente',
          estado: 'completada',
          fecha_inicio: '2024-12-15',
          participantes: 25,
          horas_completadas: 6
        },
        {
          id: 2,
          titulo: 'Campaña de Vacunación',
          categoria: 'salud',
          estado: 'en_progreso',
          fecha_inicio: '2024-12-20',
          participantes: 18,
          horas_planificadas: 8
        },
        {
          id: 3,
          titulo: 'Alfabetización Adultos',
          categoria: 'educacion',
          estado: 'planificada',
          fecha_inicio: '2025-01-05',
          participantes: 0,
          horas_planificadas: 12
        }
      ],
      tendencias: {
        ultimo_mes: 23,
        mes_anterior: 19,
        crecimiento: '+21%'
      }
    };
  }

  // Datos para gráficos temporales
  static async getChartData(type = 'actividades') {
    await this.delay(200);
    
    const activitiesData = [
      { mes: 'Ene', actividades: 8, participantes: 145 },
      { mes: 'Feb', actividades: 12, participantes: 198 },
      { mes: 'Mar', actividades: 15, participantes: 234 },
      { mes: 'Apr', actividades: 18, participantes: 287 },
      { mes: 'May', actividades: 22, participantes: 356 },
      { mes: 'Jun', actividades: 19, participantes: 298 },
      { mes: 'Jul', actividades: 25, participantes: 412 },
      { mes: 'Ago', actividades: 28, participantes: 445 },
      { mes: 'Sep', actividades: 23, participantes: 378 },
      { mes: 'Oct', actividades: 31, participantes: 487 },
      { mes: 'Nov', actividades: 27, participantes: 423 },
      { mes: 'Dic', actividades: 29, participantes: 456 }
    ];

    return activitiesData;
  }

  // Lista de voluntarios activos
  static async getVolunteers() {
    await this.delay(350);
    
    return [
      {
        id: 1,
        nombre: 'María González',
        email: 'maria@ejemplo.com',
        actividades_completadas: 12,
        horas_totales: 96,
        ultima_actividad: '2024-12-18',
        calificacion: 4.9
      },
      {
        id: 2,
        nombre: 'Carlos López',
        email: 'carlos@ejemplo.com', 
        actividades_completadas: 8,
        horas_totales: 64,
        ultima_actividad: '2024-12-15',
        calificacion: 4.7
      },
      {
        id: 3,
        nombre: 'Ana Rodríguez',
        email: 'ana@ejemplo.com',
        actividades_completadas: 15,
        horas_totales: 120,
        ultima_actividad: '2024-12-20',
        calificacion: 4.8
      }
    ];
  }

  // Generar reporte CSV
  static async generateCSVReport(type = 'actividades') {
    await this.delay(800);
    
    let csvContent = '';
    
    if (type === 'actividades') {
      csvContent = `Título,Categoría,Estado,Fecha,Participantes,Horas
Jornada de Reforestación,Medio Ambiente,Completada,2024-12-15,25,6
Campaña de Vacunación,Salud,En Progreso,2024-12-20,18,8
Alfabetización Adultos,Educación,Planificada,2025-01-05,0,12`;
    }
    
    // Simular descarga
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Reporte descargado exitosamente' };
  }
}