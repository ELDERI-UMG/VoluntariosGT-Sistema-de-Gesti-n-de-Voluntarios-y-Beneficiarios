#!/usr/bin/env node

/**
 * PRUEBA DE ENDPOINTS DEL DASHBOARD
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';

async function testDashboardEndpoints() {
  console.log('📊 PROBANDO ENDPOINTS DEL DASHBOARD');
  console.log('===================================');
  
  // Primero hacer login para obtener token
  console.log('\n1. 🔑 OBTENIENDO TOKEN DE ADMIN:');
  const loginResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `admin${Date.now()}@test.com`,
      password: 'admin123',
      nombre_completo: 'Admin Test',
      rol: 'admin'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log(`   Status: ${loginResponse.status}`);
  
  if (!loginResponse.ok) {
    console.log('❌ Error registrando admin, probando con login...');
    
    // Probar login con credenciales de prueba
    const testLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@ejemplo.com',
        password: 'password123'
      })
    });
    
    if (testLogin.ok) {
      const testData = await testLogin.json();
      var token = testData.token;
      console.log('   ✅ Login exitoso con usuario test');
    } else {
      console.log('❌ Error obteniendo token, usando sin auth');
      var token = null;
    }
  } else {
    var token = loginData.token;
    console.log('   ✅ Admin registrado exitosamente');
  }
  
  // Endpoints a probar
  const endpoints = [
    '/api/usuarios/estadisticas-admin',
    '/api/reportes/actividades', 
    '/api/certificados/estadisticas',
    '/api/actividades?limite=5&orden=fecha_creacion'
  ];
  
  console.log('\n2. 📋 PROBANDO ENDPOINTS:');
  
  for (const endpoint of endpoints) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${baseUrl}${endpoint}`, { headers });
      const text = await response.text();
      
      console.log(`\n   📊 ${endpoint}:`);
      console.log(`      Status: ${response.status}`);
      
      if (response.ok) {
        try {
          const data = JSON.parse(text);
          console.log(`      ✅ Success - ${Object.keys(data).length} keys returned`);
          console.log(`      Preview: ${JSON.stringify(data).substring(0, 100)}...`);
        } catch {
          console.log(`      ✅ Success - Response length: ${text.length}`);
        }
      } else {
        console.log(`      ❌ Error: ${text.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n✅ PRUEBA COMPLETA FINALIZADA');
}

testDashboardEndpoints();