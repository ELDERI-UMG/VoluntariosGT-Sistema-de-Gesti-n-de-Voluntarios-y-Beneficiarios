import { supabase, supabaseAdmin } from '../config.js';
import { validateEmail, validatePassword, validateDPI, sanitizeText } from '../utils/validation.js';

/**
 * Registra un nuevo usuario en el sistema
 */
export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre_completo,
      telefono,
      dpi,
      rol,
      ubicacion,
      direccion,
      fecha_nacimiento,
      genero,
      habilidades,
      disponibilidad
    } = req.body;

    // Validaciones básicas
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Contraseña inválida',
        details: passwordValidation.errors
      });
    }

    if (!nombre_completo || nombre_completo.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre completo es requerido'
      });
    }

    if (!['beneficiario', 'voluntario', 'entidad'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido. Debe ser: beneficiario, voluntario o entidad'
      });
    }

    // Validar DPI si se proporciona
    if (dpi && !validateDPI(dpi)) {
      return res.status(400).json({
        error: 'Número de DPI inválido'
      });
    }

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: sanitizeText(nombre_completo),
          rol
        }
      }
    });

    if (authError) {
      console.error('Error en registro de Supabase Auth:', authError);
      return res.status(400).json({
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'No se pudo crear el usuario'
      });
    }

    // Crear perfil del usuario
    const perfilData = {
      id: authData.user.id,
      email,
      nombre_completo: sanitizeText(nombre_completo),
      telefono: telefono ? sanitizeText(telefono) : null,
      dpi: dpi || null,
      rol,
      ubicacion: ubicacion ? `POINT(${ubicacion.lon} ${ubicacion.lat})` : null,
      direccion: direccion ? sanitizeText(direccion) : null,
      fecha_nacimiento: fecha_nacimiento || null,
      genero: genero ? sanitizeText(genero) : null,
      habilidades: habilidades || [],
      disponibilidad: disponibilidad || null
    };

    const { data: perfilCreado, error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .insert(perfilData)
      .select()
      .single();

    if (perfilError) {
      console.error('Error al crear perfil:', perfilError);
      
      // Limpiar usuario de Auth si falló la creación del perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        error: 'Error al crear el perfil del usuario'
      });
    }

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nombre_completo: perfilCreado.nombre_completo,
        rol: perfilCreado.rol,
        verificado: perfilCreado.verificado
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Inicia sesión de usuario
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Contraseña requerida'
      });
    }

    // Autenticar con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Error en login:', authError);
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Obtener perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (perfilError || !perfil) {
      console.error('Error al obtener perfil:', perfilError);
      return res.status(404).json({
        error: 'Perfil de usuario no encontrado'
      });
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nombre_completo: perfil.nombre_completo,
        rol: perfil.rol,
        verificado: perfil.verificado,
        puntos_reputacion: perfil.puntos_reputacion
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Refresca el token de acceso
 */
export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token requerido'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      console.error('Error al refrescar token:', error);
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Cierra sesión del usuario
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7);

    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('Error al cerrar sesión:', error);
      return res.status(400).json({
        error: 'Error al cerrar sesión'
      });
    }

    res.json({
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene el perfil del usuario actual
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select(`
        *,
        entidades (
          id,
          nombre_organizacion,
          tipo_organizacion,
          verificado
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !perfil) {
      console.error('Error al obtener perfil:', error);
      return res.status(404).json({
        error: 'Perfil no encontrado'
      });
    }

    res.json({
      perfil
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el perfil del usuario
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      nombre_completo,
      telefono,
      direccion,
      fecha_nacimiento,
      genero,
      habilidades,
      disponibilidad,
      ubicacion
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const updateData = {};

    if (nombre_completo) {
      updateData.nombre_completo = sanitizeText(nombre_completo);
    }
    if (telefono) {
      updateData.telefono = sanitizeText(telefono);
    }
    if (direccion) {
      updateData.direccion = sanitizeText(direccion);
    }
    if (fecha_nacimiento) {
      updateData.fecha_nacimiento = fecha_nacimiento;
    }
    if (genero) {
      updateData.genero = sanitizeText(genero);
    }
    if (habilidades) {
      updateData.habilidades = habilidades;
    }
    if (disponibilidad) {
      updateData.disponibilidad = disponibilidad;
    }
    if (ubicacion) {
      updateData.ubicacion = `POINT(${ubicacion.lon} ${ubicacion.lat})`;
    }

    const { data: perfilActualizado, error } = await supabase
      .from('perfiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar perfil:', error);
      return res.status(400).json({
        error: 'Error al actualizar perfil'
      });
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      perfil: perfilActualizado
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};

