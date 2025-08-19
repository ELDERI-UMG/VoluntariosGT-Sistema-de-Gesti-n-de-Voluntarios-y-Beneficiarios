import express from 'express';
import {
  getActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad,
  inscribirseActividad,
  getActividadesByEntidad
} from '../controllers/actividadesController.js';
import {
  authenticateUser,
  requireEntidad,
  requireVoluntario,
  validatePagination,
  validateCoordinates
} from '../utils/middleware.js';

const router = express.Router();

/**
 * @route GET /api/actividades
 * @desc Obtener todas las actividades disponibles
 * @access Public
 */
router.get('/', validatePagination, validateCoordinates, getActividades);

/**
 * @route GET /api/actividades/:id
 * @desc Obtener una actividad específica por ID
 * @access Public
 */
router.get('/:id', getActividadById);

/**
 * @route POST /api/actividades
 * @desc Crear nueva actividad
 * @access Private (Solo entidades verificadas)
 */
router.post('/', authenticateUser, requireEntidad, createActividad);

/**
 * @route PUT /api/actividades/:id
 * @desc Actualizar actividad existente
 * @access Private (Solo propietario o admin)
 */
router.put('/:id', authenticateUser, requireEntidad, updateActividad);

/**
 * @route DELETE /api/actividades/:id
 * @desc Eliminar actividad
 * @access Private (Solo propietario o admin)
 */
router.delete('/:id', authenticateUser, requireEntidad, deleteActividad);

/**
 * @route POST /api/actividades/:id/inscribirse
 * @desc Inscribirse a una actividad
 * @access Private (Solo voluntarios y beneficiarios)
 */
router.post('/:id/inscribirse', authenticateUser, requireVoluntario, inscribirseActividad);

/**
 * @route GET /api/actividades/entidad/mis-actividades
 * @desc Obtener actividades de la entidad del usuario actual
 * @access Private (Solo entidades)
 */
router.get('/entidad/mis-actividades', authenticateUser, requireEntidad, validatePagination, getActividadesByEntidad);

export default router;

