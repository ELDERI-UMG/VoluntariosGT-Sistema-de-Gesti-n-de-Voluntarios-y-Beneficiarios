import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { COLORS, STYLE_CONFIG } from '../constants/config';

const ProfileScreen = () => {
  const { user, logout, getUserDisplayInfo, getRoleInfo } = useAuth();
  
  const userInfo = getUserDisplayInfo();
  const roleInfo = getRoleInfo();

  // Manejar logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  // Renderizar elemento de información
  const renderInfoItem = (label, value, icon) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: STYLE_CONFIG.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    }}>
      <Text style={{ fontSize: 20, marginRight: STYLE_CONFIG.spacing.md }}>
        {icon}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.sm,
          color: COLORS.textSecondary,
          marginBottom: 2,
        }}>
          {label}
        </Text>
        <Text style={{
          fontSize: STYLE_CONFIG.fontSize.base,
          color: COLORS.textPrimary,
          fontWeight: STYLE_CONFIG.fontWeight.medium,
        }}>
          {value || 'No especificado'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      <ScrollView contentContainerStyle={{ padding: STYLE_CONFIG.spacing.lg }}>
        {/* Header del perfil */}
        <View style={{
          backgroundColor: COLORS.white,
          borderRadius: STYLE_CONFIG.borderRadius.xl,
          padding: STYLE_CONFIG.spacing.xl,
          alignItems: 'center',
          marginBottom: STYLE_CONFIG.spacing.lg,
          ...STYLE_CONFIG.shadows.md,
        }}>
          {/* Avatar */}
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: roleInfo?.color || COLORS.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: STYLE_CONFIG.spacing.lg,
          }}>
            <Text style={{ fontSize: 40, color: COLORS.white }}>
              {userInfo?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>

          {/* Nombre y rol */}
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize['2xl'],
            fontWeight: STYLE_CONFIG.fontWeight.bold,
            color: COLORS.textPrimary,
            textAlign: 'center',
            marginBottom: STYLE_CONFIG.spacing.xs,
          }}>
            {userInfo?.name}
          </Text>

          <View style={{
            backgroundColor: (roleInfo?.color || COLORS.primary) + '20',
            paddingHorizontal: STYLE_CONFIG.spacing.md,
            paddingVertical: STYLE_CONFIG.spacing.xs,
            borderRadius: STYLE_CONFIG.borderRadius.full,
            marginBottom: STYLE_CONFIG.spacing.sm,
          }}>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.sm,
              color: roleInfo?.color || COLORS.primary,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}>
              {roleInfo?.name}
            </Text>
          </View>

          {/* Estado de verificación */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: userInfo?.verified ? COLORS.success + '20' : COLORS.warning + '20',
            paddingHorizontal: STYLE_CONFIG.spacing.md,
            paddingVertical: STYLE_CONFIG.spacing.xs,
            borderRadius: STYLE_CONFIG.borderRadius.md,
          }}>
            <Text style={{ fontSize: 16, marginRight: 4 }}>
              {userInfo?.verified ? '✅' : '⚠️'}
            </Text>
            <Text style={{
              fontSize: STYLE_CONFIG.fontSize.sm,
              color: userInfo?.verified ? COLORS.success : COLORS.warning,
              fontWeight: STYLE_CONFIG.fontWeight.medium,
            }}>
              {userInfo?.verified ? 'Cuenta Verificada' : 'Cuenta No Verificada'}
            </Text>
          </View>

          {/* Puntos de reputación para voluntarios */}
          {user?.rol === 'voluntario' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: STYLE_CONFIG.spacing.md,
            }}>
              <Text style={{ fontSize: 20, marginRight: 4 }}>⭐</Text>
              <Text style={{
                fontSize: STYLE_CONFIG.fontSize.base,
                color: COLORS.textPrimary,
                fontWeight: STYLE_CONFIG.fontWeight.medium,
              }}>
                {userInfo?.reputation || 0} puntos de reputación
              </Text>
            </View>
          )}
        </View>

        {/* Información personal */}
        <View style={{
          backgroundColor: COLORS.white,
          borderRadius: STYLE_CONFIG.borderRadius.xl,
          padding: STYLE_CONFIG.spacing.lg,
          marginBottom: STYLE_CONFIG.spacing.lg,
          ...STYLE_CONFIG.shadows.sm,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xl,
            fontWeight: STYLE_CONFIG.fontWeight.semibold,
            color: COLORS.textPrimary,
            marginBottom: STYLE_CONFIG.spacing.lg,
          }}>
            Información Personal
          </Text>

          {renderInfoItem('Correo Electrónico', userInfo?.email, '📧')}
          {renderInfoItem('Teléfono', userInfo?.phone, '📱')}
          {renderInfoItem('Fecha de Registro', 
            userInfo?.joinDate ? new Date(userInfo.joinDate).toLocaleDateString('es-GT') : null, 
            '📅'
          )}
        </View>

        {/* Acciones */}
        <View style={{
          backgroundColor: COLORS.white,
          borderRadius: STYLE_CONFIG.borderRadius.xl,
          padding: STYLE_CONFIG.spacing.lg,
          marginBottom: STYLE_CONFIG.spacing.lg,
          ...STYLE_CONFIG.shadows.sm,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xl,
            fontWeight: STYLE_CONFIG.fontWeight.semibold,
            color: COLORS.textPrimary,
            marginBottom: STYLE_CONFIG.spacing.lg,
          }}>
            Configuración
          </Text>

          <Button
            title="Editar Perfil"
            onPress={() => {/* TODO: Navegar a editar perfil */}}
            variant="outline"
            fullWidth
            style={{ marginBottom: STYLE_CONFIG.spacing.md }}
            icon={<Text style={{ color: COLORS.primary }}>✏️</Text>}
          />

          {!userInfo?.verified && (
            <Button
              title="Verificar Cuenta"
              onPress={() => {/* TODO: Navegar a verificación */}}
              variant="secondary"
              fullWidth
              style={{ marginBottom: STYLE_CONFIG.spacing.md }}
              icon={<Text style={{ color: COLORS.primary }}>✅</Text>}
            />
          )}

          {user?.rol === 'voluntario' && (
            <Button
              title="Mis Certificados"
              onPress={() => {/* TODO: Navegar a certificados */}}
              variant="outline"
              fullWidth
              style={{ marginBottom: STYLE_CONFIG.spacing.md }}
              icon={<Text style={{ color: COLORS.primary }}>🏆</Text>}
            />
          )}

          <Button
            title="Configuración de Notificaciones"
            onPress={() => {/* TODO: Navegar a configuración */}}
            variant="outline"
            fullWidth
            style={{ marginBottom: STYLE_CONFIG.spacing.md }}
            icon={<Text style={{ color: COLORS.primary }}>🔔</Text>}
          />
        </View>

        {/* Información adicional */}
        <View style={{
          backgroundColor: COLORS.white,
          borderRadius: STYLE_CONFIG.borderRadius.xl,
          padding: STYLE_CONFIG.spacing.lg,
          marginBottom: STYLE_CONFIG.spacing.lg,
          ...STYLE_CONFIG.shadows.sm,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.xl,
            fontWeight: STYLE_CONFIG.fontWeight.semibold,
            color: COLORS.textPrimary,
            marginBottom: STYLE_CONFIG.spacing.lg,
          }}>
            Soporte
          </Text>

          <Button
            title="Centro de Ayuda"
            onPress={() => {/* TODO: Abrir centro de ayuda */}}
            variant="ghost"
            fullWidth
            style={{ marginBottom: STYLE_CONFIG.spacing.sm }}
            icon={<Text style={{ color: COLORS.primary }}>❓</Text>}
          />

          <Button
            title="Términos y Condiciones"
            onPress={() => {/* TODO: Abrir términos */}}
            variant="ghost"
            fullWidth
            style={{ marginBottom: STYLE_CONFIG.spacing.sm }}
            icon={<Text style={{ color: COLORS.primary }}>📄</Text>}
          />

          <Button
            title="Política de Privacidad"
            onPress={() => {/* TODO: Abrir política */}}
            variant="ghost"
            fullWidth
            style={{ marginBottom: STYLE_CONFIG.spacing.sm }}
            icon={<Text style={{ color: COLORS.primary }}>🔒</Text>}
          />
        </View>

        {/* Botón de cerrar sesión */}
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="error"
          fullWidth
          icon={<Text style={{ color: COLORS.white }}>🚪</Text>}
        />

        {/* Información de la app */}
        <View style={{
          alignItems: 'center',
          marginTop: STYLE_CONFIG.spacing.xl,
          paddingTop: STYLE_CONFIG.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}>
          <Text style={{
            fontSize: STYLE_CONFIG.fontSize.sm,
            color: COLORS.textSecondary,
            textAlign: 'center',
          }}>
            VoluntariosGT v1.0.0{'\n'}
            Desarrollado para el impacto social en Guatemala 🇬🇹
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

