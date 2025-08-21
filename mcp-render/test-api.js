#!/usr/bin/env node

/**
 * TEST DIRECTO DE LA API DE RENDER
 */

import RenderMCP from './index.js';

async function testAPI() {
  try {
    console.log('🚀 Probando API de Render...');
    
    const render = new RenderMCP();
    
    console.log('\n📊 1. Obteniendo información del servicio...');
    const service = await render.getServiceInfo();
    console.log('✅ Servicio obtenido exitosamente');
    
    console.log('\n💚 2. Verificando salud del servicio...');
    const health = await render.healthCheck();
    console.log('✅ Health check completado');
    
    console.log('\n🚀 3. Listando deployments...');
    const deployments = await render.listDeployments(3);
    console.log('✅ Deployments obtenidos');
    
    console.log('\n⚙️ 4. Listando variables de entorno...');
    const envVars = await render.listEnvironmentVariables();
    console.log('✅ Variables obtenidas');
    
    console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();