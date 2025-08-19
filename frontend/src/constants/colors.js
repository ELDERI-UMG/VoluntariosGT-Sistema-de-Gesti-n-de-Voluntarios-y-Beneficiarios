// Paleta de colores del sistema
export const COLORS = {
  // Colores principales
  primary: '#1ABC9C',      // Turquesa principal
  primaryLight: '#48C9B0',
  primaryDark: '#16A085',
  
  // Colores secundarios
  secondary: '#2C3E50',    // Gris oscuro
  secondaryLight: '#34495E',
  secondaryDark: '#1B2631',
  
  // Colores de estado
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Colores neutros
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  
  // Colores de fondo
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#2C3E50',
  
  // Colores de texto
  textPrimary: '#2C3E50',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textWhite: '#FFFFFF',
  
  // Colores de borde
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  borderDark: '#ADB5BD',
  
  // Colores específicos de la app
  volunteer: '#3498DB',    // Azul para voluntarios
  beneficiary: '#9B59B6',  // Púrpura para beneficiarios
  entity: '#E67E22',       // Naranja para entidades
  
  // Estados de actividad
  activityOpen: '#27AE60',
  activityClosed: '#E74C3C',
  activityCompleted: '#8E44AD',
  activityCancelled: '#95A5A6',
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Gradientes
  gradientPrimary: ['#1ABC9C', '#16A085'],
  gradientSecondary: ['#3498DB', '#2980B9'],
  gradientSuccess: ['#27AE60', '#229954'],
  gradientWarning: ['#F39C12', '#E67E22'],
  gradientError: ['#E74C3C', '#C0392B'],
};

// Mapeo de colores por rol
export const ROLE_COLORS = {
  voluntario: COLORS.volunteer,
  beneficiario: COLORS.beneficiary,
  entidad: COLORS.entity,
  admin: COLORS.secondary,
};

// Mapeo de colores por estado de actividad
export const ACTIVITY_STATUS_COLORS = {
  abierta: COLORS.activityOpen,
  cerrada: COLORS.activityClosed,
  completada: COLORS.activityCompleted,
  cancelada: COLORS.activityCancelled,
};

// Mapeo de colores por estado de inscripción
export const INSCRIPTION_STATUS_COLORS = {
  inscrito: COLORS.info,
  confirmado: COLORS.warning,
  completado: COLORS.success,
  cancelado: COLORS.error,
};

export default COLORS;

