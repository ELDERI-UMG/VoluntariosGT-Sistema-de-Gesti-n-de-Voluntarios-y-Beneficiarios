
import { supabase, supabaseAdmin } from '../config.js';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Autenticar con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = data.user;
    const session = data.session;

    // Respuesta exitosa (compatible con dashboard)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.user_metadata?.nombre_completo || user.email.split('@')[0],
        rol: user.user_metadata?.role || 'voluntario',
        verificado: user.user_metadata?.verificado || true
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      },
      // También incluir formato legacy para compatibilidad
      token: session.access_token,
      refreshToken: session.refresh_token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, nombre_completo, rol } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre_completo,
        role: rol || 'voluntario',
        verificado: true
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre_completo,
        rol: rol || 'voluntario'
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const token = authHeader.substring(7);

    // Verificar token con Supabase directamente
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Devolver información del usuario desde Auth
    res.json({
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.user_metadata?.nombre_completo || user.email.split('@')[0],
        rol: user.user_metadata?.role || 'voluntario',
        verificado: user.user_metadata?.verificado || true,
        telefono: user.user_metadata?.telefono,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { nombre_completo, telefono } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Actualizar metadata del usuario
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        nombre_completo,
        telefono,
        // Mantener otros campos existentes
        role: req.user.user_metadata?.role || 'voluntario',
        verificado: req.user.user_metadata?.verificado || true
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre_completo,
        telefono,
        rol: data.user.user_metadata?.role || 'voluntario'
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export {
  login,
  register,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};
