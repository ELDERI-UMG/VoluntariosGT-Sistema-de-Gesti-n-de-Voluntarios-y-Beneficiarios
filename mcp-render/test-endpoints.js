#!/usr/bin/env node

/**
 * PRUEBA COMPLETA DE ENDPOINTS
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';

const endpoints = [
  { method: 'GET', path: '/', name: 'Root' },
  { method: 'GET', path: '/health', name: 'Health' },
  { method: 'GET', path: '/api/actividades', name: 'Actividades GET' },
  { method: 'POST', path: '/api/auth/login', name: 'Auth Login', body: { email: 'test', password: 'test' } },
  { method: 'GET', path: '/api/usuarios', name: 'Usuarios GET' },
  { method: 'GET', path: '/api/certificados', name: 'Certificados GET' }
];

async function testEndpoints() {
  console.log('🧪 PROBANDO TODOS LOS ENDPOINTS');
  console.log('================================');
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, options);
      const text = await response.text();
      
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${endpoint.name}: HTTP ${response.status}`);
      
      if (!response.ok) {
        console.log(`     Error: ${text.substring(0, 100)}`);
      } else {
        console.log(`     OK: ${text.substring(0, 80)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
    
    console.log('');
  }
}

testEndpoints();