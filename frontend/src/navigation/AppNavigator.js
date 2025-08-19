import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Pantallas principales (placeholder por ahora)
import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';

import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Navegador principal con tabs
const MainTabNavigator = () => {
  const { user, getRoleInfo } = useAuth();
  const roleInfo = getRoleInfo();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          tabBarLabel: 'Actividades',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>📋</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🗺️</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        text="Cargando..."
        backgroundColor={COLORS.background}
      />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;

