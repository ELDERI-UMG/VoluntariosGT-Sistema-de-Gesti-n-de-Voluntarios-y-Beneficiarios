#!/usr/bin/env node

/**
 * DIAGNÓSTICO ESPECÍFICO DE RUTAS DE AUTH
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';

async function diagnoseAuth() {
  console.log('🔍 DIAGNÓSTICO DETALLADO DE AUTH');
  console.log('================================');
  
  try {
    // 1. Verificar que el servicio esté activo
    console.log('\n1. 💚 VERIFICANDO SERVICIO:');
    const healthResponse = await fetch(`${baseUrl}/health`, { timeout: 10000 });
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Uptime: ${healthData.uptime}s`);
    console.log(`   Timestamp: ${healthData.timestamp}`);
    
    // 2. Verificar endpoint raíz
    console.log('\n2. 🏠 VERIFICANDO ENDPOINT RAÍZ:');
    const rootResponse = await fetch(`${baseUrl}/`, { timeout: 10000 });
    const rootData = await rootResponse.json();
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Endpoints disponibles:`, Object.keys(rootData.endpoints || {}));
    
    // 3. Verificar diferentes variaciones de auth
    console.log('\n3. 🔐 PROBANDO VARIACIONES DE AUTH:');
    
    const authVariations = [
      '/api/auth/login',
      '/api/auth/',
      '/api/auth',
      '/auth/login',
      '/auth'
    ];
    
    for (const path of authVariations) {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test', password: 'test' }),
          timeout: 5000
        });
        
        const text = await response.text();
        console.log(`   ${path}: HTTP ${response.status} - ${text.substring(0, 80)}`);
        
      } catch (error) {
        console.log(`   ${path}: ERROR - ${error.message}`);
      }
    }
    
    // 4. Verificar headers de respuesta
    console.log('\n4. 📋 VERIFICANDO HEADERS:');
    const headersResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'HEAD'
    });
    
    console.log(`   Status: ${headersResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(headersResponse.headers.entries()));
    
    // 5. Verificar con curl directo (simulado)
    console.log('\n5. 🌐 VERIFICANDO CONECTIVIDAD:');
    const directResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NodeJS-Diagnostics/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    
    const directText = await directResponse.text();
    console.log(`   Direct call: HTTP ${directResponse.status}`);
    console.log(`   Response: ${directText}`);
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnoseAuth();