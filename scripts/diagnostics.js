#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 DIAGNÓSTICO DE ERRORES - VoluntariosGT\n');

// Función para ejecutar comandos y capturar salida
function runCommand(command, cwd = rootDir) {
  try {
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

// Verificar estructura de proyecto
function checkProjectStructure() {
  console.log('📁 Verificando estructura del proyecto...');
  
  const requiredDirs = [
    'backend',
    'frontend', 
    'dashboard-web',
    'backend/src',
    'frontend/src',
    'dashboard-web/src'
  ];
  
  const requiredFiles = [
    'package.json',
    'backend/package.json',
    'frontend/package.json',
    'dashboard-web/package.json',
    'backend/src/server.js',
    'backend/src/config.js'
  ];
  
  let issues = [];
  
  // Verificar directorios
  requiredDirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      issues.push(`❌ Directorio faltante: ${dir}`);
    } else {
      console.log(`✅ ${dir}`);
    }
  });
  
  // Verificar archivos
  requiredFiles.forEach(file => {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      issues.push(`❌ Archivo faltante: ${file}`);
    } else {
      console.log(`✅ ${file}`);
    }
  });
  
  if (issues.length > 0) {
    console.log('\n⚠️ PROBLEMAS ENCONTRADOS:');
    issues.forEach(issue => console.log(issue));
  }
  
  return issues;
}

// Verificar dependencias
function checkDependencies() {
  console.log('\n📦 Verificando dependencias...');
  
  const workspaces = ['backend', 'frontend', 'dashboard-web'];
  let issues = [];
  
  workspaces.forEach(workspace => {
    console.log(`\n🔍 Verificando ${workspace}...`);
    
    const workspaceDir = path.join(rootDir, workspace);
    if (!fs.existsSync(workspaceDir)) {
      issues.push(`❌ Workspace ${workspace} no existe`);
      return;
    }
    
    // Verificar si node_modules existe
    const nodeModulesPath = path.join(workspaceDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      issues.push(`❌ ${workspace}: node_modules faltante`);
      console.log(`  ❌ node_modules no encontrado`);
    } else {
      console.log(`  ✅ node_modules presente`);
    }
    
    // Verificar package.json
    const packageJsonPath = path.join(workspaceDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log(`  ✅ package.json válido`);
        console.log(`  📋 Nombre: ${packageJson.name}`);
        console.log(`  📋 Versión: ${packageJson.version}`);
        
        // Verificar dependencias críticas
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const criticalDeps = workspace === 'backend' 
          ? ['express', 'cors', 'helmet']
          : workspace === 'frontend'
          ? ['react-native', 'expo']
          : ['react', 'vite'];
          
        criticalDeps.forEach(dep => {
          if (!deps[dep]) {
            issues.push(`⚠️ ${workspace}: dependencia crítica faltante - ${dep}`);
          }
        });
        
      } catch (error) {
        issues.push(`❌ ${workspace}: package.json inválido`);
        console.log(`  ❌ Error leyendo package.json: ${error.message}`);
      }
    }
  });
  
  return issues;
}

// Verificar configuración
function checkConfiguration() {
  console.log('\n⚙️ Verificando configuración...');
  
  let issues = [];
  
  // Verificar archivo de configuración del backend
  const configPath = path.join(rootDir, 'backend', 'src', 'config.js');
  if (fs.existsSync(configPath)) {
    console.log('✅ Archivo de configuración del backend encontrado');
    
    // Verificar variables de entorno críticas
    const envVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    const envPath = path.join(rootDir, 'backend', '.env');
    
    if (fs.existsSync(envPath)) {
      console.log('✅ Archivo .env encontrado');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      envVars.forEach(varName => {
        if (!envContent.includes(varName)) {
          issues.push(`⚠️ Variable de entorno faltante: ${varName}`);
        } else {
          console.log(`  ✅ ${varName} configurado`);
        }
      });
    } else {
      issues.push('❌ Archivo .env del backend faltante');
    }
  } else {
    issues.push('❌ Archivo de configuración del backend faltante');
  }
  
  // Verificar configuración del frontend
  const frontendConfigPath = path.join(rootDir, 'frontend', 'src', 'constants', 'config.js');
  if (fs.existsSync(frontendConfigPath)) {
    console.log('✅ Configuración del frontend encontrada');
  } else {
    issues.push('❌ Configuración del frontend faltante');
  }
  
  return issues;
}

// Verificar puertos
function checkPorts() {
  console.log('\n🚪 Verificando puertos...');
  
  const ports = [5000, 5001, 8081, 5173];
  let issues = [];
  
  ports.forEach(port => {
    const result = runCommand(`netstat -an | findstr :${port}`, rootDir);
    if (result.success && result.output.includes(`${port}`)) {
      console.log(`⚠️ Puerto ${port} está en uso`);
    } else {
      console.log(`✅ Puerto ${port} disponible`);
    }
  });
  
  return issues;
}

// Ejecutar tests
function runTests() {
  console.log('\n🧪 Ejecutando tests...');
  
  let issues = [];
  
  // Test del backend
  console.log('🔍 Testing backend...');
  const backendTest = runCommand('npm test', path.join(rootDir, 'backend'));
  if (!backendTest.success) {
    issues.push('❌ Tests del backend fallaron');
    console.log('Error:', backendTest.error);
  } else {
    console.log('✅ Tests del backend exitosos');
  }
  
  // Verificar linting
  console.log('🔍 Verificando código...');
  const lintResult = runCommand('npm run lint', rootDir);
  if (!lintResult.success) {
    console.log('⚠️ Linting no configurado o falló');
  } else {
    console.log('✅ Código cumple estándares');
  }
  
  return issues;
}

// Verificar conectividad
function checkConnectivity() {
  console.log('\n🌐 Verificando conectividad...');
  
  let issues = [];
  
  // Verificar si los servicios están ejecutándose
  const healthCheck = runCommand('curl -s http://localhost:5000/health || curl -s http://localhost:5001/health');
  if (healthCheck.success) {
    try {
      const response = JSON.parse(healthCheck.output);
      if (response.status === 'OK') {
        console.log('✅ Backend responde correctamente');
        console.log(`  📊 Uptime: ${Math.floor(response.uptime)} segundos`);
        console.log(`  🌍 Entorno: ${response.environment}`);
      }
    } catch (error) {
      issues.push('❌ Backend responde pero con formato inválido');
    }
  } else {
    issues.push('❌ Backend no responde');
    console.log('ℹ️ Intenta iniciar el backend con: npm run start:backend');
  }
  
  return issues;
}

// Verificar logs de errores
function checkErrorLogs() {
  console.log('\n📋 Verificando logs de errores...');
  
  let issues = [];
  
  // Buscar logs del backend
  const logsDir = path.join(rootDir, 'backend', 'logs');
  if (fs.existsSync(logsDir)) {
    const logFiles = fs.readdirSync(logsDir);
    
    if (logFiles.length > 0) {
      console.log(`📁 ${logFiles.length} archivos de log encontrados:`);
      
      logFiles.forEach(file => {
        const logPath = path.join(logsDir, file);
        const stats = fs.statSync(logPath);
        console.log(`  📄 ${file} (${Math.round(stats.size / 1024)} KB)`);
        
        // Si hay logs de error recientes, reportar
        if (file.includes('error') && stats.mtime > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          issues.push(`⚠️ Errores recientes en: ${file}`);
        }
      });
    } else {
      console.log('✅ No hay logs de error');
    }
  } else {
    console.log('ℹ️ Directorio de logs no existe (normal en primer uso)');
  }
  
  return issues;
}

// Generar reporte final
function generateReport(allIssues) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 REPORTE FINAL DE DIAGNÓSTICO');
  console.log('='.repeat(50));
  
  if (allIssues.length === 0) {
    console.log('🎉 ¡No se encontraron problemas críticos!');
    console.log('\n💡 Si sigues teniendo errores:');
    console.log('   1. Revisa los logs en backend/logs/');
    console.log('   2. Verifica la consola del navegador/app');
    console.log('   3. Asegúrate de que Supabase esté configurado correctamente');
  } else {
    console.log(`⚠️ ${allIssues.length} problema(s) encontrado(s):\n`);
    
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n💡 RECOMENDACIONES:');
    
    if (allIssues.some(issue => issue.includes('node_modules'))) {
      console.log('   🔧 Reinstalar dependencias: npm run install:all');
    }
    
    if (allIssues.some(issue => issue.includes('Archivo faltante'))) {
      console.log('   🔧 Verificar que todos los archivos estén presentes');
    }
    
    if (allIssues.some(issue => issue.includes('Variable de entorno'))) {
      console.log('   🔧 Configurar variables de entorno en .env');
    }
    
    if (allIssues.some(issue => issue.includes('Backend no responde'))) {
      console.log('   🔧 Iniciar servicios: npm run start');
    }
  }
  
  console.log('\n📞 Para soporte adicional:');
  console.log('   📧 elder@voluntariosgt.org');
  console.log('   📚 Ver documentación en docs/');
}

// Función principal
async function main() {
  const allIssues = [];
  
  try {
    // Ejecutar todas las verificaciones
    allIssues.push(...checkProjectStructure());
    allIssues.push(...checkDependencies());
    allIssues.push(...checkConfiguration());
    allIssues.push(...checkPorts());
    allIssues.push(...runTests());
    allIssues.push(...checkConnectivity());
    allIssues.push(...checkErrorLogs());
    
    // Generar reporte
    generateReport(allIssues);
    
  } catch (error) {
    console.error('❌ Error ejecutando diagnóstico:', error.message);
    process.exit(1);
  }
}

// Ejecutar diagnóstico
main();