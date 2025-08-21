#!/usr/bin/env node

/**
 * PRUEBA ESPECÍFICA DE RUTAS DE AUTENTICACIÓN
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';

const authRoutes = [
  { method: 'POST', path: '/api/auth/register', name: 'Register', body: { email: 'test@test.com', password: '123456', nombre_completo: 'Test User' } },
  { method: 'POST', path: '/api/auth/login', name: 'Login', body: { email: 'test@test.com', password: '123456' } },
  { method: 'GET', path: '/api/auth/', name: 'Auth Root' },
  { method: 'GET', path: '/api/auth', name: 'Auth (no slash)' },
  { method: 'POST', path: '/api/auth/refresh', name: 'Refresh Token' },
  { method: 'POST', path: '/api/auth/logout', name: 'Logout' }
];

async function testAuthRoutes() {
  console.log('🔐 PROBANDO RUTAS DE AUTENTICACIÓN');
  console.log('==================================');
  
  for (const route of authRoutes) {
    try {
      const options = {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      };
      
      if (route.body) {
        options.body = JSON.stringify(route.body);
      }
      
      console.log(`\n🧪 Probando: ${route.method} ${route.path}`);
      
      const response = await fetch(`${baseUrl}${route.path}`, options);
      const text = await response.text();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🔍 DIAGNÓSTICO ADICIONAL:');
  
  // Probar si el problema es de CORS o de ruta
  try {
    const response = await fetch(`${baseUrl}/api/auth`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:3000' }
    });
    console.log(`   OPTIONS /api/auth: ${response.status}`);
  } catch (error) {
    console.log(`   OPTIONS error: ${error.message}`);
  }
}

testAuthRoutes();