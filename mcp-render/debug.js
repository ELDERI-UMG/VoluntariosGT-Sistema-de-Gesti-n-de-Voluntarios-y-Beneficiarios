#!/usr/bin/env node

/**
 * SCRIPT DE DEBUG PARA MCP RENDER
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 DEBUG MCP RENDER');
console.log('===================');
console.log('');

console.log('📋 Variables de entorno:');
console.log(`   RENDER_API_TOKEN: ${process.env.RENDER_API_TOKEN ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`   RENDER_SERVICE_ID: ${process.env.RENDER_SERVICE_ID || 'NO CONFIGURADO'}`);
console.log(`   RENDER_SERVICE_URL: ${process.env.RENDER_SERVICE_URL || 'NO CONFIGURADO'}`);
console.log('');

// Test básico de la clase
console.log('🧪 Probando inicialización de la clase...');
try {
  const { default: RenderMCP } = await import('./index.js');
  console.log('✅ Importación exitosa');
  
  const render = new RenderMCP();
  console.log('✅ Inicialización exitosa');
  console.log(`   API Token: ${render.apiToken ? 'OK' : 'ERROR'}`);
  console.log(`   Service ID: ${render.serviceId || 'ERROR'}`);
  console.log(`   Base URL: ${render.baseUrl}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}