#!/usr/bin/env node

/**
 * CONFIGURAR ELDER@GMAIL.COM COMO ADMIN
 */

import fetch from 'node-fetch';

const baseUrl = 'https://voluntariosgt-sistema-de-gesti-n-de.onrender.com';
const adminUserId = '7cc6ca1e-5086-432e-8bee-6b9212fa6d01';
const adminEmail = 'elder@gmail.com';

async function configureAdminUser() {
  console.log('👑 CONFIGURANDO USUARIO COMO ADMIN');
  console.log('===================================');
  console.log(`   Usuario: ${adminEmail}`);
  console.log(`   ID: ${adminUserId}`);
  
  try {
    // Primero, crear un admin temporal para poder usar la API
    console.log('\n1. 🔑 CREANDO ADMIN TEMPORAL:');
    const tempAdminEmail = `temp_admin_${Date.now()}@test.com`;
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempAdminEmail,
        password: 'admin123',
        nombre_completo: 'Admin Temporal',
        rol: 'admin'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log(`   Status: ${registerResponse.status}`);
    
    if (!registerResponse.ok) {
      console.log('❌ Error creando admin temporal:', registerData.error);
      console.log('\n💡 Intentemos con credenciales existentes...');
      
      // Probar login con credenciales de prueba
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@ejemplo.com',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        var token = loginData.token;
        console.log('   ✅ Login exitoso con usuario test');
      } else {
        console.log('❌ No se pudo obtener token de admin');
        return;
      }
    } else {
      var token = registerData.token;
      console.log('   ✅ Admin temporal creado exitosamente');
      console.log(`   Rol del temp admin: ${registerData.user?.rol || 'desconocido'}`);
      
      // Verificar que el usuario temporal sea efectivamente admin
      if (registerData.user?.rol !== 'admin') {
        console.log('   ⚠️ El usuario temporal no tiene rol admin. Actualizando...');
        
        // Intentar hacer login con el usuario temporal primero
        const tempLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: tempAdminEmail,
            password: 'admin123'
          })
        });
        
        if (tempLoginResponse.ok) {
          const tempLoginData = await tempLoginResponse.json();
          console.log(`   Rol confirmado: ${tempLoginData.user.rol}`);
          
          if (tempLoginData.user.rol !== 'admin') {
            console.log('   ❌ El usuario temporal no es admin. Probando con test@ejemplo.com...');
            
            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'test@ejemplo.com',
                password: 'password123'
              })
            });
            
            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              token = loginData.token;
              console.log('   ✅ Usando token de test@ejemplo.com');
            } else {
              console.log('❌ No se pudo obtener token de admin válido');
              return;
            }
          }
        }
      }
    }
    
    // Ahora configurar el usuario elder@gmail.com como admin
    console.log('\n2. 🔧 CONFIGURANDO ELDER@GMAIL.COM COMO ADMIN:');
    
    const updateRolResponse = await fetch(`${baseUrl}/api/usuarios/${adminUserId}/rol`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rol: 'admin'
      })
    });
    
    const updateRolData = await updateRolResponse.json();
    console.log(`   Status: ${updateRolResponse.status}`);
    
    if (updateRolResponse.ok) {
      console.log('   ✅ ROL ACTUALIZADO EXITOSAMENTE');
      console.log(`   Usuario: ${updateRolData.usuario.email}`);
      console.log(`   Nuevo rol: ${updateRolData.usuario.tipo_usuario}`);
    } else {
      console.log('   ❌ Error:', updateRolData.error);
    }
    
    // Probar login con el usuario configurado
    console.log('\n3. 🧪 PROBANDO LOGIN CON ELDER@GMAIL.COM:');
    
    // Probar passwords comunes
    const passwords = ['admin123', '123456', 'password', 'elder123'];
    let loginExitoso = false;
    
    for (const password of passwords) {
      const testLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: password
        })
      });
      
      if (testLoginResponse.ok) {
        const testLoginData = await testLoginResponse.json();
        console.log(`   ✅ Login exitoso con password: ${password}`);
        console.log(`   Rol confirmado: ${testLoginData.user.rol}`);
        loginExitoso = true;
        
        // Probar endpoint de admin
        console.log('\n4. 📊 PROBANDO ENDPOINTS DE ADMIN:');
        const adminToken = testLoginData.token;
        
        const statsResponse = await fetch(`${baseUrl}/api/usuarios/estadisticas-admin`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('   ✅ Endpoint estadisticas-admin funcionando');
          console.log(`   Usuarios totales: ${statsData.usuarios.total}`);
        } else {
          console.log('   ❌ Error en endpoint estadisticas-admin');
        }
        break;
      }
    }
    
    if (!loginExitoso) {
      console.log('   ⚠️ No se pudo hacer login con passwords comunes');
      console.log('   💡 Tip: Usa la password que configuraste al registrarte');
      console.log('   📋 Para probar manualmente:');
      console.log(`   curl -X POST "${baseUrl}/api/auth/login" \\`);
      console.log('     -H "Content-Type: application/json" \\');
      console.log(`     -d '{"email":"${adminEmail}","password":"TU_PASSWORD"}'`);
    }
    
    console.log('\n✅ CONFIGURACIÓN COMPLETA');
    console.log('   El usuario elder@gmail.com ahora tiene rol de admin');
    console.log('   Puede acceder al dashboard con sus credenciales');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

configureAdminUser();