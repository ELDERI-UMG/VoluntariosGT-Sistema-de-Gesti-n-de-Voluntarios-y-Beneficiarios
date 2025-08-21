import express from 'express';
import {
  generarCertificadoPDF,
  validarCertificado,
  getEstadisticasCertificados
} from '../controllers/certificadosController.js';
import {
  authenticateUser,
  requireVoluntario
} from '../utils/middleware.js';

const router = express.Router();

/**
 * @route GET /api/certificados/:certificadoId/pdf
 * @desc Generar y descargar certificado en PDF
 * @access Private (Solo propietario del certificado)
 */
router.get('/:certificadoId/pdf', authenticateUser, requireVoluntario, generarCertificadoPDF);

/**
 * @route GET /api/certificados/validar/:numeroCertificado
 * @desc Validar un certificado por su número
 * @access Public
 */
router.get('/validar/:numeroCertificado', validarCertificado);

/**
 * @route GET /api/certificados/estadisticas
 * @desc Obtener estadísticas de certificados del usuario
 * @access Private (Voluntarios y beneficiarios)
 */
router.get('/estadisticas', authenticateUser, getEstadisticasCertificados);

export default router;

