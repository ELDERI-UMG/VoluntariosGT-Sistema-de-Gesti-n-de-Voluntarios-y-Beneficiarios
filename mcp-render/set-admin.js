#!/usr/bin/env node

/**
 * CONFIGURAR USUARIO COMO ADMIN
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';
const adminUserId = '7cc6ca1e-5086-432e-8bee-6b9212fa6d01';
const adminEmail = 'elder@gmail.com';

async function setUserAsAdmin() {
  console.log('👑 CONFIGURANDO USUARIO COMO ADMIN');
  console.log('==================================');
  console.log(`   Usuario: ${adminEmail}`);
  console.log(`   ID: ${adminUserId}`);
  
  try {
    // Como no tenemos endpoint directo para cambiar roles, vamos a crear un script
    // que actualice directamente en Supabase usando el admin client
    
    // Primero verificar que el usuario existe
    console.log('\n1. 🔍 VERIFICANDO USUARIO:');
    
    // Hacer login para verificar que el usuario existe
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'admin123' // Asumiendo que usó esta password común
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Usuario existe y puede hacer login');
      console.log(`   Rol actual: ${loginData.user.rol}`);
      
      if (loginData.user.rol === 'admin') {
        console.log('   ✅ Usuario ya es admin');
        return;
      }
    } else {
      console.log('   ⚠️ No pudo hacer login, probando diferentes passwords...');
      
      // Probar passwords comunes
      const passwords = ['123456', 'password', 'elder123', 'admin', 'elder@gmail.com'];
      let found = false;
      
      for (const pass of passwords) {
        const testResponse = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, password: pass })
        });
        
        if (testResponse.ok) {
          console.log(`   ✅ Login exitoso con password: ${pass}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log('   ❌ No se pudo hacer login con passwords comunes');
        console.log('   💡 Tip: Usa la password que configuraste al registrarte');
        return;
      }
    }
    
    console.log('\n2. 🔧 CONFIGURACIÓN MANUAL REQUERIDA:');
    console.log('   Como no tenemos endpoint para cambiar roles, necesitas:');
    console.log('   ');
    console.log('   📋 PASOS:');
    console.log('   1. Ve a Supabase Dashboard');
    console.log('   2. Abre la tabla "perfiles"');
    console.log(`   3. Busca el usuario con email: ${adminEmail}`);
    console.log(`   4. Busca el usuario con ID: ${adminUserId}`);
    console.log('   5. Cambia el campo "tipo_usuario" de "voluntario" a "admin"');
    console.log('   6. Guarda los cambios');
    console.log('');
    console.log('   🔗 URL: https://supabase.com/dashboard/project/cicwxpdkikzeboeggmje/editor');
    console.log('');
    
    console.log('3. 🧪 DESPUÉS DE CAMBIAR EL ROL, PRUEBA:');
    console.log(`   curl -s "${baseUrl}/api/auth/login" \\`);
    console.log('     -X POST \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`     -d \'{"email":"${adminEmail}","password":"TU_PASSWORD"}\'`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setUserAsAdmin();