import express from 'express';
import {
  getMisInscripciones,
  cancelarInscripcion,
  subirEvidencia,
  getMisCertificados,
  crearEntidad,
  getMiEntidad,
  actualizarDPI,
  getEstadisticasAdmin,
  actualizarRolUsuario
} from '../controllers/usuariosController.js';
import {
  authenticateUser,
  requireVoluntario,
  requireEntidad,
  requireAdmin,
  validatePagination
} from '../utils/middleware.js';

const router = express.Router();

/**
 * @route GET /api/usuarios/mis-inscripciones
 * @desc Obtener inscripciones del usuario actual
 * @access Private (Voluntarios y beneficiarios)
 */
router.get('/mis-inscripciones', authenticateUser, requireVoluntario, validatePagination, getMisInscripciones);

/**
 * @route PUT /api/usuarios/inscripciones/:inscripcionId/cancelar
 * @desc Cancelar una inscripción
 * @access Private (Voluntarios y beneficiarios)
 */
router.put('/inscripciones/:inscripcionId/cancelar', authenticateUser, requireVoluntario, cancelarInscripcion);

/**
 * @route PUT /api/usuarios/inscripciones/:inscripcionId/evidencia
 * @desc Subir evidencia de participación
 * @access Private (Voluntarios y beneficiarios)
 */
router.put('/inscripciones/:inscripcionId/evidencia', authenticateUser, requireVoluntario, subirEvidencia);

/**
 * @route GET /api/usuarios/mis-certificados
 * @desc Obtener certificados del usuario actual
 * @access Private (Voluntarios y beneficiarios)
 */
router.get('/mis-certificados', authenticateUser, requireVoluntario, validatePagination, getMisCertificados);

/**
 * @route POST /api/usuarios/entidad
 * @desc Crear o actualizar entidad del usuario
 * @access Private
 */
router.post('/entidad', authenticateUser, crearEntidad);

/**
 * @route GET /api/usuarios/mi-entidad
 * @desc Obtener entidad del usuario actual
 * @access Private (Entidades)
 */
router.get('/mi-entidad', authenticateUser, requireEntidad, getMiEntidad);

/**
 * @route PUT /api/usuarios/dpi
 * @desc Actualizar DPI del usuario
 * @access Private
 */
router.put('/dpi', authenticateUser, actualizarDPI);

/**
 * @route GET /api/usuarios/estadisticas-admin
 * @desc Obtener estadísticas administrativas del sistema
 * @access Private (Solo admins)
 */
router.get('/estadisticas-admin', authenticateUser, requireAdmin, getEstadisticasAdmin);

/**
 * @route PUT /api/usuarios/:userId/rol
 * @desc Actualizar rol de un usuario
 * @access Private (Solo admins)
 */
router.put('/:userId/rol', authenticateUser, requireAdmin, actualizarRolUsuario);

export default router;

