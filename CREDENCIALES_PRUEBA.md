# Credenciales de Prueba - VoluntariosGT

## Usuarios Disponibles para Testing

### 1. Usuario Voluntario 🙋‍♀️
- **Email**: `test@voluntariosgt.com`
- **Contraseña**: `Test123!`
- **Rol**: Voluntario
- **Permisos**: Ver actividades, inscribirse, generar certificados

### 2. Usuario Beneficiario 🤲
- **Email**: `beneficiario@voluntariosgt.com`
- **Contraseña**: `Test123!`
- **Rol**: Beneficiario
- **Permisos**: Solicitar ayuda, ver actividades disponibles

### 3. Usuario Entidad 🏢
- **Email**: `entidad@voluntariosgt.com`
- **Contraseña**: `Test123!`
- **Rol**: Entidad (Organización)
- **Organización**: Fundación Guatemala
- **Permisos**: Crear actividades, gestionar voluntarios, generar reportes

## Instrucciones de Uso

1. **Acceder a la aplicación móvil**: 
   - Ve a `http://localhost:8085` en tu navegador
   - O usa la app Expo en tu dispositivo móvil

2. **Iniciar sesión**:
   - Selecciona cualquiera de las credenciales de arriba
   - Usa el email y contraseña exactos
   - Todos los usuarios están verificados y activos

3. **Dashboard web** (solo para entidades):
   - Ve a `http://localhost:5173` para el panel administrativo
   - Usa las credenciales de entidad para acceder

## Estado del Sistema

✅ **Backend API**: Funcionando en `http://localhost:5001`
✅ **Base de datos**: Conectada a Supabase
✅ **Autenticación**: JWT tokens funcionando
✅ **Frontend móvil**: Ejecutándose en `http://localhost:8085`
🔄 **Dashboard web**: Puerto 5173 (iniciar con `npm run start:dashboard`)

## Próximas Funcionalidades

- 🗺️ Sistema de mapas y geolocalización
- 📋 Gestión completa de actividades
- 🔔 Notificaciones push
- 📜 Generación de certificados PDF

---
*Última actualización: 24 de agosto de 2025*