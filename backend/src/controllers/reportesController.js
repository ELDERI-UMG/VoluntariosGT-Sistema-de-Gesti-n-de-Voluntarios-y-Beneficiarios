import { supabase, supabaseAdmin } from '../config.js';

/**
 * Obtiene estadísticas generales del sistema
 */
export const getEstadisticasGenerales = async (req, res) => {
  try {
    // Solo admins pueden ver estadísticas generales
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para ver estas estadísticas'
      });
    }

    // Usar la función SQL creada previamente
    const { data: estadisticas, error } = await supabase
      .rpc('obtener_estadisticas_impacto');

    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        error: 'Error al obtener estadísticas'
      });
    }

    const stats = estadisticas[0] || {};

    res.json({
      estadisticas: {
        usuarios: {
          total_voluntarios: parseInt(stats.total_voluntarios) || 0,
          total_beneficiarios: parseInt(stats.total_beneficiarios) || 0,
          total_entidades: parseInt(stats.total_entidades) || 0
        },
        actividades: {
          total_actividades: parseInt(stats.total_actividades) || 0,
          actividades_completadas: parseInt(stats.actividades_completadas) || 0,
          tasa_completacion: stats.total_actividades > 0 
            ? ((stats.actividades_completadas / stats.total_actividades) * 100).toFixed(2)
            : 0
        },
        impacto: {
          total_horas_voluntariado: parseFloat(stats.total_horas_voluntariado) || 0,
          total_certificados: parseInt(stats.total_certificados) || 0,
          promedio_calificacion: parseFloat(stats.promedio_calificacion) || 0
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene reporte de actividades por período
 */
export const getReporteActividades = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, entidad_id, categoria } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.rol;

    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'entidad') {
      return res.status(403).json({
        error: 'No tienes permisos para ver reportes de actividades'
      });
    }

    let query = supabase
      .from('actividades')
      .select('*');

    // Si es entidad, solo mostrar sus actividades
    if (userRole === 'entidad') {
      const { data: entidad } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', userId)
        .single();

      if (entidad) {
        query = query.eq('entidad_id', entidad.id);
      }
    } else if (entidad_id) {
      // Si es admin y especifica entidad
      query = query.eq('entidad_id', entidad_id);
    }

    // Filtros de fecha
    if (fecha_inicio) {
      query = query.gte('fecha_inicio', fecha_inicio);
    }
    if (fecha_fin) {
      query = query.lte('fecha_fin', fecha_fin);
    }

    // Filtro de categoría
    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    query = query.order('fecha_inicio', { ascending: false });

    const { data: actividades, error } = await query;

    if (error) {
      console.error('Error al obtener reporte de actividades:', error);
      // Return empty report to prevent dashboard errors
      return res.json({
        total_actividades: 0,
        actividades_por_estado: {},
        actividades_por_categoria: {},
        total_inscripciones: 0,
        total_horas_planificadas: 0,
        total_horas_completadas: 0,
        actividades: []
      });
    }

    // Procesar datos para el reporte
    const reporte = {
      total_actividades: actividades?.length || 0,
      actividades_por_estado: {},
      actividades_por_categoria: {},
      total_inscripciones: 0,
      total_horas_planificadas: 0,
      total_horas_completadas: 0,
      actividades: actividades?.map(actividad => {
        const horasActividad = actividad.fecha_fin && actividad.fecha_inicio
          ? (new Date(actividad.fecha_fin) - new Date(actividad.fecha_inicio)) / (1000 * 60 * 60)
          : 0;

        return {
          id: actividad.id,
          titulo: actividad.titulo,
          categoria: actividad.categoria,
          estado: actividad.estado,
          fecha_inicio: actividad.fecha_inicio,
          fecha_fin: actividad.fecha_fin,
          cupos_totales: actividad.cupos_totales,
          cupos_ocupados: actividad.cupos_ocupados,
          entidad: actividad.entidad_id, // Simplified
          total_inscripciones: actividad.cupos_ocupados || 0,
          inscripciones_completadas: 0, // Simplified
          horas_planificadas: horasActividad,
          horas_completadas: 0 // Simplified
        };
      }) || []
    };

    // Calcular totales y agrupaciones
    reporte.actividades.forEach(actividad => {
      // Por estado
      reporte.actividades_por_estado[actividad.estado] = 
        (reporte.actividades_por_estado[actividad.estado] || 0) + 1;

      // Por categoría
      const categoria = actividad.categoria || 'Sin categoría';
      reporte.actividades_por_categoria[categoria] = 
        (reporte.actividades_por_categoria[categoria] || 0) + 1;

      // Totales
      reporte.total_inscripciones += actividad.total_inscripciones;
      reporte.total_horas_planificadas += actividad.horas_planificadas;
      reporte.total_horas_completadas += actividad.horas_completadas;
    });

    res.json({
      reporte,
      filtros_aplicados: {
        fecha_inicio,
        fecha_fin,
        entidad_id,
        categoria
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de actividades:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene reporte de voluntarios más activos
 */
export const getReporteVoluntarios = async (req, res) => {
  try {
    const { limite = 10, fecha_inicio, fecha_fin } = req.query;

    // Solo admins pueden ver este reporte
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para ver este reporte'
      });
    }

    let query = supabase
      .from('inscripciones')
      .select(`
        voluntario_id,
        estado,
        horas_completadas,
        calificacion,
        perfiles (
          nombre_completo,
          puntos_reputacion,
          created_at
        ),
        actividades (
          fecha_inicio,
          categoria
        )
      `)
      .eq('estado', 'completado');

    // Filtros de fecha
    if (fecha_inicio || fecha_fin) {
      query = query.select(`
        voluntario_id,
        estado,
        horas_completadas,
        calificacion,
        perfiles (
          nombre_completo,
          puntos_reputacion,
          created_at
        ),
        actividades!inner (
          fecha_inicio,
          categoria
        )
      `);

      if (fecha_inicio) {
        query = query.gte('actividades.fecha_inicio', fecha_inicio);
      }
      if (fecha_fin) {
        query = query.lte('actividades.fecha_inicio', fecha_fin);
      }
    }

    const { data: inscripciones, error } = await query;

    if (error) {
      console.error('Error al obtener datos de voluntarios:', error);
      return res.status(500).json({
        error: 'Error al obtener datos de voluntarios'
      });
    }

    // Agrupar por voluntario
    const voluntariosMap = new Map();

    inscripciones?.forEach(inscripcion => {
      const voluntarioId = inscripcion.voluntario_id;
      
      if (!voluntariosMap.has(voluntarioId)) {
        voluntariosMap.set(voluntarioId, {
          id: voluntarioId,
          nombre: inscripcion.perfiles?.nombre_completo || 'Nombre no disponible',
          puntos_reputacion: inscripcion.perfiles?.puntos_reputacion || 0,
          fecha_registro: inscripcion.perfiles?.created_at,
          total_actividades: 0,
          total_horas: 0,
          calificacion_promedio: 0,
          calificaciones: [],
          categorias: new Set()
        });
      }

      const voluntario = voluntariosMap.get(voluntarioId);
      voluntario.total_actividades += 1;
      voluntario.total_horas += inscripcion.horas_completadas || 0;
      
      if (inscripcion.calificacion) {
        voluntario.calificaciones.push(inscripcion.calificacion);
      }
      
      if (inscripcion.actividades?.categoria) {
        voluntario.categorias.add(inscripcion.actividades.categoria);
      }
    });

    // Procesar y ordenar voluntarios
    const voluntarios = Array.from(voluntariosMap.values())
      .map(voluntario => ({
        ...voluntario,
        calificacion_promedio: voluntario.calificaciones.length > 0
          ? (voluntario.calificaciones.reduce((sum, cal) => sum + cal, 0) / voluntario.calificaciones.length).toFixed(2)
          : 0,
        categorias_participadas: Array.from(voluntario.categorias),
        total_categorias: voluntario.categorias.size
      }))
      .sort((a, b) => {
        // Ordenar por total de horas, luego por actividades, luego por calificación
        if (b.total_horas !== a.total_horas) return b.total_horas - a.total_horas;
        if (b.total_actividades !== a.total_actividades) return b.total_actividades - a.total_actividades;
        return b.calificacion_promedio - a.calificacion_promedio;
      })
      .slice(0, parseInt(limite));

    res.json({
      voluntarios_mas_activos: voluntarios,
      total_voluntarios_activos: voluntariosMap.size,
      filtros_aplicados: {
        limite: parseInt(limite),
        fecha_inicio,
        fecha_fin
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de voluntarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene datos para mapa de calor de actividades
 */
export const getMapaCalorActividades = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Solo admins pueden ver este reporte
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para ver este reporte'
      });
    }

    let query = supabase
      .from('actividades')
      .select(`
        id,
        titulo,
        ubicacion,
        fecha_inicio,
        cupos_totales,
        cupos_ocupados,
        estado,
        entidades (
          nombre_organizacion
        )
      `);

    // Filtros de fecha
    if (fecha_inicio) {
      query = query.gte('fecha_inicio', fecha_inicio);
    }
    if (fecha_fin) {
      query = query.lte('fecha_inicio', fecha_fin);
    }

    const { data: actividades, error } = await query;

    if (error) {
      console.error('Error al obtener datos para mapa de calor:', error);
      return res.status(500).json({
        error: 'Error al obtener datos para mapa de calor'
      });
    }

    // Procesar ubicaciones para el mapa de calor
    const puntosCalor = actividades?.map(actividad => {
      let lat = null, lon = null;

      if (actividad.ubicacion) {
        const match = actividad.ubicacion.match(/POINT\(([^)]+)\)/);
        if (match) {
          [lon, lat] = match[1].split(' ').map(Number);
        }
      }

      return {
        id: actividad.id,
        titulo: actividad.titulo,
        lat,
        lon,
        intensidad: actividad.cupos_ocupados || 0,
        cupos_totales: actividad.cupos_totales,
        cupos_ocupados: actividad.cupos_ocupados,
        estado: actividad.estado,
        entidad: actividad.entidades?.nombre_organizacion,
        fecha_inicio: actividad.fecha_inicio
      };
    }).filter(punto => punto.lat && punto.lon) || [];

    // Estadísticas por zona (simplificado por departamento)
    const zonas = {};
    puntosCalor.forEach(punto => {
      // Simplificación: agrupar por coordenadas redondeadas
      const zonaKey = `${Math.round(punto.lat * 10) / 10},${Math.round(punto.lon * 10) / 10}`;
      
      if (!zonas[zonaKey]) {
        zonas[zonaKey] = {
          lat: Math.round(punto.lat * 10) / 10,
          lon: Math.round(punto.lon * 10) / 10,
          total_actividades: 0,
          total_cupos: 0,
          total_ocupados: 0,
          actividades: []
        };
      }

      zonas[zonaKey].total_actividades += 1;
      zonas[zonaKey].total_cupos += punto.cupos_totales;
      zonas[zonaKey].total_ocupados += punto.cupos_ocupados;
      zonas[zonaKey].actividades.push({
        titulo: punto.titulo,
        entidad: punto.entidad,
        fecha: punto.fecha_inicio
      });
    });

    res.json({
      puntos_calor: puntosCalor,
      zonas_actividad: Object.values(zonas),
      estadisticas: {
        total_puntos: puntosCalor.length,
        total_zonas: Object.keys(zonas).length,
        actividad_promedio_por_zona: Object.keys(zonas).length > 0 
          ? (puntosCalor.length / Object.keys(zonas).length).toFixed(2)
          : 0
      },
      filtros_aplicados: {
        fecha_inicio,
        fecha_fin
      }
    });

  } catch (error) {
    console.error('Error al generar mapa de calor:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Exporta reporte en formato CSV
 */
export const exportarReporteCSV = async (req, res) => {
  try {
    const { tipo, fecha_inicio, fecha_fin } = req.query;

    // Solo admins pueden exportar reportes
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para exportar reportes'
      });
    }

    let csvContent = '';
    let filename = '';

    switch (tipo) {
      case 'actividades':
        const reporteActividades = await generarCSVActividades(fecha_inicio, fecha_fin);
        csvContent = reporteActividades.csv;
        filename = `reporte_actividades_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'voluntarios':
        const reporteVoluntarios = await generarCSVVoluntarios(fecha_inicio, fecha_fin);
        csvContent = reporteVoluntarios.csv;
        filename = `reporte_voluntarios_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'certificados':
        const reporteCertificados = await generarCSVCertificados(fecha_inicio, fecha_fin);
        csvContent = reporteCertificados.csv;
        filename = `reporte_certificados_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({
          error: 'Tipo de reporte no válido. Opciones: actividades, voluntarios, certificados'
        });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent); // BOM para UTF-8

  } catch (error) {
    console.error('Error al exportar reporte CSV:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Funciones auxiliares para generar CSV
const generarCSVActividades = async (fechaInicio, fechaFin) => {
  let query = supabase
    .from('actividades')
    .select(`
      titulo,
      categoria,
      estado,
      fecha_inicio,
      fecha_fin,
      cupos_totales,
      cupos_ocupados,
      direccion_completa,
      entidades (
        nombre_organizacion,
        tipo_organizacion
      )
    `);

  if (fechaInicio) query = query.gte('fecha_inicio', fechaInicio);
  if (fechaFin) query = query.lte('fecha_inicio', fechaFin);

  const { data: actividades } = await query;

  const headers = [
    'Título',
    'Categoría',
    'Estado',
    'Fecha Inicio',
    'Fecha Fin',
    'Cupos Totales',
    'Cupos Ocupados',
    'Dirección',
    'Organización',
    'Tipo Organización'
  ];

  let csv = headers.join(',') + '\n';

  actividades?.forEach(actividad => {
    const row = [
      `"${actividad.titulo || ''}"`,
      `"${actividad.categoria || ''}"`,
      `"${actividad.estado || ''}"`,
      `"${actividad.fecha_inicio || ''}"`,
      `"${actividad.fecha_fin || ''}"`,
      actividad.cupos_totales || 0,
      actividad.cupos_ocupados || 0,
      `"${actividad.direccion_completa || ''}"`,
      `"${actividad.entidades?.nombre_organizacion || ''}"`,
      `"${actividad.entidades?.tipo_organizacion || ''}"`
    ];
    csv += row.join(',') + '\n';
  });

  return { csv };
};

const generarCSVVoluntarios = async (fechaInicio, fechaFin) => {
  let query = supabase
    .from('perfiles')
    .select(`
      nombre_completo,
      email,
      telefono,
      puntos_reputacion,
      created_at,
      inscripciones (
        estado,
        horas_completadas,
        actividades (
          fecha_inicio,
          titulo
        )
      )
    `)
    .eq('rol', 'voluntario');

  const { data: voluntarios } = await query;

  const headers = [
    'Nombre Completo',
    'Email',
    'Teléfono',
    'Puntos Reputación',
    'Fecha Registro',
    'Total Actividades',
    'Total Horas',
    'Actividades Completadas'
  ];

  let csv = headers.join(',') + '\n';

  voluntarios?.forEach(voluntario => {
    const inscripciones = voluntario.inscripciones || [];
    const actividadesCompletadas = inscripciones.filter(i => i.estado === 'completado');
    const totalHoras = actividadesCompletadas.reduce((sum, i) => sum + (i.horas_completadas || 0), 0);

    const row = [
      `"${voluntario.nombre_completo || ''}"`,
      `"${voluntario.email || ''}"`,
      `"${voluntario.telefono || ''}"`,
      voluntario.puntos_reputacion || 0,
      `"${voluntario.created_at || ''}"`,
      inscripciones.length,
      totalHoras,
      actividadesCompletadas.length
    ];
    csv += row.join(',') + '\n';
  });

  return { csv };
};

const generarCSVCertificados = async (fechaInicio, fechaFin) => {
  let query = supabase
    .from('certificados')
    .select(`
      numero_certificado,
      fecha_emision,
      horas_certificadas,
      perfiles (
        nombre_completo,
        email
      ),
      actividades (
        titulo,
        categoria,
        entidades (
          nombre_organizacion
        )
      )
    `);

  if (fechaInicio) query = query.gte('fecha_emision', fechaInicio);
  if (fechaFin) query = query.lte('fecha_emision', fechaFin);

  const { data: certificados } = await query;

  const headers = [
    'Número Certificado',
    'Fecha Emisión',
    'Horas Certificadas',
    'Voluntario',
    'Email Voluntario',
    'Actividad',
    'Categoría',
    'Organización'
  ];

  let csv = headers.join(',') + '\n';

  certificados?.forEach(certificado => {
    const row = [
      `"${certificado.numero_certificado || ''}"`,
      `"${certificado.fecha_emision || ''}"`,
      certificado.horas_certificadas || 0,
      `"${certificado.perfiles?.nombre_completo || ''}"`,
      `"${certificado.perfiles?.email || ''}"`,
      `"${certificado.actividades?.titulo || ''}"`,
      `"${certificado.actividades?.categoria || ''}"`,
      `"${certificado.actividades?.entidades?.nombre_organizacion || ''}"`
    ];
    csv += row.join(',') + '\n';
  });

  return { csv };
};

export default {
  getEstadisticasGenerales,
  getReporteActividades,
  getReporteVoluntarios,
  getMapaCalorActividades,
  exportarReporteCSV
};

