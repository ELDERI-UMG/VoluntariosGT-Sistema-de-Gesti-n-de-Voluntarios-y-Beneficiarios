#!/usr/bin/env node

/**
 * PRUEBA COMPLETA DEL SISTEMA DE AUTENTICACIÓN
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';

async function testCompleteAuth() {
  console.log('🔐 PRUEBA COMPLETA DE AUTENTICACIÓN');
  console.log('===================================');
  
  try {
    // 1. REGISTRO
    console.log('\n1. 📝 PROBANDO REGISTRO:');
    const email = `test${Date.now()}@ejemplo.com`;
    const password = 'password123';
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        nombre_completo: 'Usuario Test',
        rol: 'voluntario'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response: ${JSON.stringify(registerData, null, 2)}`);
    
    if (!registerResponse.ok) {
      console.log('❌ Registro falló, deteniendo pruebas');
      return;
    }
    
    // 2. LOGIN
    console.log('\n2. 🔑 PROBANDO LOGIN:');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   User: ${loginData.user?.email}`);
    console.log(`   Token: ${loginData.token ? 'Presente' : 'Ausente'}`);
    
    if (!loginResponse.ok) {
      console.log('❌ Login falló');
      return;
    }
    
    const token = loginData.token;
    
    // 3. PERFIL
    console.log('\n3. 👤 PROBANDO PERFIL:');
    const profileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    
    console.log(`   Status: ${profileResponse.status}`);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log(`   Profile: ${JSON.stringify(profileData, null, 2)}`);
    } else {
      const error = await profileResponse.text();
      console.log(`   Error: ${error}`);
    }
    
    // 4. LOGOUT
    console.log('\n4. 🚪 PROBANDO LOGOUT:');
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    
    const logoutData = await logoutResponse.json();
    console.log(`   Status: ${logoutResponse.status}`);
    console.log(`   Response: ${JSON.stringify(logoutData)}`);
    
    console.log('\n✅ PRUEBA COMPLETA FINALIZADA');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testCompleteAuth();