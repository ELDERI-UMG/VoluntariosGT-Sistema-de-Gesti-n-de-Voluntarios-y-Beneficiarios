#!/usr/bin/env node

/**
 * DIAGNÓSTICO DEL DEPLOYMENT
 */

import RenderMCP from './index.js';
import fetch from 'node-fetch';

async function diagnoseDeployment() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL DEPLOYMENT');
  console.log('=====================================');
  
  const render = new RenderMCP();
  
  try {
    // 1. Health check básico
    console.log('\n1. 💚 HEALTH CHECK BÁSICO:');
    const health = await render.healthCheck();
    console.log(`   Estado: ${health.status}`);
    
    // 2. Verificar endpoints específicos
    console.log('\n2. 🔍 VERIFICANDO ENDPOINTS API:');
    
    const endpoints = [
      '/health',
      '/api',
      '/api/auth/health',
      '/api/actividades'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const url = `${render.serviceUrl}${endpoint}`;
        const response = await fetch(url, { timeout: 5000 });
        const status = response.ok ? '✅' : '❌';
        console.log(`   ${status} ${endpoint} - HTTP ${response.status}`);
        
        if (endpoint === '/api/actividades' && !response.ok) {
          const errorText = await response.text();
          console.log(`     Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
      }
    }
    
    // 3. Verificar información del servicio
    console.log('\n3. 📊 INFORMACIÓN DEL SERVICIO:');
    const service = await render.getServiceInfo();
    console.log(`   Estado: ${service.serviceDetails?.state || 'unknown'}`);
    console.log(`   Última actualización: ${service.updatedAt ? new Date(service.updatedAt).toLocaleString() : 'N/A'}`);
    
    // 4. Verificar métricas
    console.log('\n4. 📈 MÉTRICAS:');
    const metrics = await render.getMetrics();
    console.log(`   Servicio disponible: ${metrics.service ? 'Sí' : 'No'}`);
    console.log(`   Health status: ${metrics.health.status}`);
    
    console.log('\n✅ DIAGNÓSTICO COMPLETO');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnoseDeployment();