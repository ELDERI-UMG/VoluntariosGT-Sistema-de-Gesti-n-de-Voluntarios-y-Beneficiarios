import express from 'express';
import {
  getEstadisticasGenerales,
  getReporteActividades,
  getReporteVoluntarios,
  getMapaCalorActividades,
  exportarReporteCSV
} from '../controllers/reportesController.js';
import {
  authenticateUser,
  requireAdmin,
  requireEntidad
} from '../utils/middleware.js';

const router = express.Router();

/**
 * @route GET /api/reportes/estadisticas-generales
 * @desc Obtener estadísticas generales del sistema
 * @access Private (Solo admins)
 */
router.get('/estadisticas-generales', authenticateUser, requireAdmin, getEstadisticasGenerales);

/**
 * @route GET /api/reportes/actividades
 * @desc Obtener reporte de actividades por período
 * @access Private (Admins y entidades)
 */
router.get('/actividades', authenticateUser, getReporteActividades);

/**
 * @route GET /api/reportes/voluntarios
 * @desc Obtener reporte de voluntarios más activos
 * @access Private (Solo admins)
 */
router.get('/voluntarios', authenticateUser, requireAdmin, getReporteVoluntarios);

/**
 * @route GET /api/reportes/mapa-calor
 * @desc Obtener datos para mapa de calor de actividades
 * @access Private (Solo admins)
 */
router.get('/mapa-calor', authenticateUser, requireAdmin, getMapaCalorActividades);

/**
 * @route GET /api/reportes/exportar-csv
 * @desc Exportar reporte en formato CSV
 * @access Private (Solo admins)
 */
router.get('/exportar-csv', authenticateUser, requireAdmin, exportarReporteCSV);

export default router;

