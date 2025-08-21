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

  // Datos de certificados
  static async getCertificatesData() {
    await this.delay(400);
    
    return {
      estadisticas: {
        total_emitidos: 1458,
        este_mes: 89,
        pendientes: 23,
        templates_activos: 5
      },
      certificados_recientes: [
        {
          id: 'CERT-2024-001234',
          voluntario: 'María González',
          actividad: 'Jornada de Reforestación',
          fecha_emision: '2024-12-18',
          horas: 6,
          estado: 'emitido',
          template: 'Medio Ambiente'
        },
        {
          id: 'CERT-2024-001235',
          voluntario: 'Carlos López',
          actividad: 'Campaña de Vacunación',
          fecha_emision: '2024-12-17',
          horas: 8,
          estado: 'emitido',
          template: 'Salud'
        },
        {
          id: 'CERT-2024-001236',
          voluntario: 'Ana Rodríguez',
          actividad: 'Alfabetización Adultos',
          fecha_emision: '2024-12-16',
          horas: 12,
          estado: 'pendiente',
          template: 'Educación'
        },
        {
          id: 'CERT-2024-001237',
          voluntario: 'Luis Martínez',
          actividad: 'Limpieza de Playas',
          fecha_emision: '2024-12-15',
          horas: 4,
          estado: 'emitido',
          template: 'Medio Ambiente'
        },
        {
          id: 'CERT-2024-001238',
          voluntario: 'Sofia Hernández',
          actividad: 'Apoyo a Adultos Mayores',
          fecha_emision: '2024-12-14',
          horas: 10,
          estado: 'emitido',
          template: 'Social'
        }
      ],
      templates: [
        {
          id: 1,
          nombre: 'Medio Ambiente',
          descripcion: 'Certificado para actividades ambientales',
          activo: true,
          usos: 245
        },
        {
          id: 2,
          nombre: 'Salud',
          descripcion: 'Certificado para actividades de salud',
          activo: true,
          usos: 198
        },
        {
          id: 3,
          nombre: 'Educación',
          descripcion: 'Certificado para actividades educativas',
          activo: true,
          usos: 312
        },
        {
          id: 4,
          nombre: 'Social',
          descripcion: 'Certificado para actividades sociales',
          activo: true,
          usos: 167
        },
        {
          id: 5,
          nombre: 'Deportes',
          descripcion: 'Certificado para actividades deportivas',
          activo: false,
          usos: 89
        }
      ]
    };
  }

  // Generar certificado individual
  static async generateCertificate(data) {
    await this.delay(1500); // Simular procesamiento de PDF
    
    const certificateId = `CERT-${new Date().getFullYear()}-${Math.random().toString().substr(2, 6)}`;
    
    // Simular generación de PDF
    const pdfContent = this.createMockPDF(data, certificateId);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Auto-descargar el certificado
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${certificateId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      certificateId,
      message: `Certificado ${certificateId} generado exitosamente`,
      downloadUrl: url
    };
  }

  // Crear PDF mock (simulado)
  static createMockPDF(data, certificateId) {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(CERTIFICADO DE VOLUNTARIADO) Tj
0 -50 Td
(ID: ${certificateId}) Tj
0 -30 Td
(Voluntario: ${data.voluntario || 'Demo User'}) Tj
0 -30 Td
(Actividad: ${data.actividad || 'Actividad Demo'}) Tj
0 -30 Td
(Horas: ${data.horas || '8'} horas) Tj
0 -30 Td
(Fecha: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF`;
  }

  // Buscar certificados
  static async searchCertificates(query = '', filters = {}) {
    await this.delay(300);
    
    const allCertificates = (await this.getCertificatesData()).certificados_recientes;
    
    let filtered = allCertificates;
    
    // Filtrar por búsqueda
    if (query) {
      filtered = filtered.filter(cert => 
        cert.voluntario.toLowerCase().includes(query.toLowerCase()) ||
        cert.actividad.toLowerCase().includes(query.toLowerCase()) ||
        cert.id.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(cert => cert.estado === filters.estado);
    }
    
    // Filtrar por template
    if (filters.template) {
      filtered = filtered.filter(cert => cert.template === filters.template);
    }
    
    return filtered;
  }
}