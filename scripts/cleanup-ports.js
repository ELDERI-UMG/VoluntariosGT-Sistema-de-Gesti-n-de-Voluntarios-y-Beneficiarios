#!/usr/bin/env node

import { execSync } from 'child_process';

const ports = [5000, 5001, 8081, 8082, 8083, 5173];

console.log('🧹 Limpiando puertos ocupados...\n');

function findProcessOnPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    const lines = result.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'TCP' && parts[1].includes(`:${port}`) && parts[3] === 'LISTENING') {
        return parts[4]; // PID
      }
    }
  } catch (error) {
    // Puerto no está en uso
  }
  return null;
}

function killProcess(pid) {
  try {
    execSync(`powershell "Stop-Process -Id ${pid} -Force"`, { 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    return true;
  } catch (error) {
    return false;
  }
}

ports.forEach(port => {
  const pid = findProcessOnPort(port);
  
  if (pid) {
    console.log(`🔍 Puerto ${port} ocupado por proceso ${pid}`);
    
    if (killProcess(pid)) {
      console.log(`✅ Puerto ${port} liberado`);
    } else {
      console.log(`❌ No se pudo liberar puerto ${port}`);
    }
  } else {
    console.log(`✅ Puerto ${port} disponible`);
  }
});

console.log('\n🎯 Limpieza completada. Puertos listos para usar.');