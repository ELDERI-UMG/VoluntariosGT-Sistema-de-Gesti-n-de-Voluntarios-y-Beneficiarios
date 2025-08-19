import express from 'express';
import {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  getConteoNoLeidas,
  crearNotificacion,
  procesarNotificacionesProgramadas
} from '../controllers/notificacionesController.js';
import {
  authenticateUser,
  requireAdmin,
  validatePagination
} from '../utils/middleware.js';

const router = express.Router();

/**
 * @route GET /api/notificaciones
 * @desc Obtener notificaciones del usuario
 * @access Private
 */
router.get('/', authenticateUser, validatePagination, getNotificaciones);

/**
 * @route PUT /api/notificaciones/:notificacionId/leida
 * @desc Marcar notificación como leída
 * @access Private
 */
router.put('/:notificacionId/leida', authenticateUser, marcarComoLeida);

/**
 * @route PUT /api/notificaciones/marcar-todas-leidas
 * @desc Marcar todas las notificaciones como leídas
 * @access Private
 */
router.put('/marcar-todas-leidas', authenticateUser, marcarTodasComoLeidas);

/**
 * @route DELETE /api/notificaciones/:notificacionId
 * @desc Eliminar notificación
 * @access Private
 */
router.delete('/:notificacionId', authenticateUser, eliminarNotificacion);

/**
 * @route GET /api/notificaciones/conteo-no-leidas
 * @desc Obtener conteo de notificaciones no leídas
 * @access Private
 */
router.get('/conteo-no-leidas', authenticateUser, getConteoNoLeidas);

/**
 * @route POST /api/notificaciones
 * @desc Crear nueva notificación
 * @access Private (Solo admins)
 */
router.post('/', authenticateUser, requireAdmin, crearNotificacion);

/**
 * @route POST /api/notificaciones/procesar-programadas
 * @desc Procesar notificaciones programadas
 * @access Private (Solo admins)
 */
router.post('/procesar-programadas', authenticateUser, requireAdmin, procesarNotificacionesProgramadas);

export default router;

