#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Función para formatear logs JSON
function formatLogEntry(logLine) {
  try {
    const logEntry = JSON.parse(logLine);
    const timestamp = new Date(logEntry.timestamp).toLocaleString();
    
    let coloredLevel;
    switch (logEntry.level.toUpperCase()) {
      case 'ERROR':
        coloredLevel = colorize('ERROR', 'red');
        break;
      case 'WARN':
        coloredLevel = colorize('WARN', 'yellow');
        break;
      case 'INFO':
        coloredLevel = colorize('INFO', 'blue');
        break;
      case 'DEBUG':
        coloredLevel = colorize('DEBUG', 'gray');
        break;
      default:
        coloredLevel = logEntry.level;
    }
    
    let output = `${colorize(timestamp, 'gray')} [${coloredLevel}] ${logEntry.message}`;
    
    // Agregar información adicional si existe
    if (logEntry.method && logEntry.url) {
      output += ` ${colorize(logEntry.method, 'green')} ${logEntry.url}`;
    }
    
    if (logEntry.status) {
      const statusColor = logEntry.status >= 400 ? 'red' : logEntry.status >= 300 ? 'yellow' : 'green';
      output += ` [${colorize(logEntry.status, statusColor)}]`;
    }
    
    if (logEntry.responseTime) {
      output += ` (${logEntry.responseTime})`;
    }
    
    if (logEntry.error) {
      output += '\n  ' + colorize(JSON.stringify(logEntry.error, null, 2), 'red');
    }
    
    return output;
  } catch (error) {
    // Si no es JSON válido, devolver la línea original
    return logLine;
  }
}

// Función para leer logs
function readLogs(logType = 'all', lines = 50, follow = false) {
  const logsDir = path.join(rootDir, 'backend', 'logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('📂 No hay directorio de logs. Inicia la aplicación para generar logs.');
    return;
  }
  
  const logFiles = fs.readdirSync(logsDir);
  
  if (logFiles.length === 0) {
    console.log('📄 No hay archivos de log disponibles.');
    return;
  }
  
  console.log('📋 VISOR DE LOGS - VoluntariosGT\n');
  
  // Filtrar archivos según el tipo solicitado
  let filteredFiles = logFiles;
  if (logType !== 'all') {
    filteredFiles = logFiles.filter(file => file.includes(logType.toLowerCase()));
  }
  
  if (filteredFiles.length === 0) {
    console.log(`❌ No hay logs del tipo '${logType}' disponibles.`);
    console.log('Tipos disponibles:', logFiles.map(f => f.split('-')[0]).join(', '));
    return;
  }
  
  // Ordenar archivos por fecha de modificación (más recientes primero)
  filteredFiles.sort((a, b) => {
    const statA = fs.statSync(path.join(logsDir, a));
    const statB = fs.statSync(path.join(logsDir, b));
    return statB.mtime - statA.mtime;
  });
  
  console.log(`📁 Archivos encontrados: ${filteredFiles.join(', ')}\n`);
  
  // Leer cada archivo
  filteredFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    console.log(colorize(`📄 ${file}`, 'blue'));
    console.log(colorize(`   Tamaño: ${Math.round(stats.size / 1024)} KB`, 'gray'));
    console.log(colorize(`   Modificado: ${stats.mtime.toLocaleString()}`, 'gray'));
    console.log('─'.repeat(50));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const logLines = content.trim().split('\n').filter(line => line.trim());
      
      if (logLines.length === 0) {
        console.log('   (Archivo vacío)');
      } else {
        // Mostrar las últimas N líneas
        const displayLines = lines > 0 ? logLines.slice(-lines) : logLines;
        
        displayLines.forEach(line => {
          console.log('   ' + formatLogEntry(line));
        });
        
        if (logLines.length > lines && lines > 0) {
          console.log(colorize(`   ... (${logLines.length - lines} líneas más)`, 'gray'));
        }
      }
    } catch (error) {
      console.log(colorize(`   Error leyendo archivo: ${error.message}`, 'red'));
    }
    
    console.log('');
  });
}

// Función para seguir logs en tiempo real (simulado)
function followLogs() {
  console.log('👁️ Siguiendo logs en tiempo real... (Ctrl+C para salir)\n');
  
  const logsDir = path.join(rootDir, 'backend', 'logs');
  let lastSizes = {};
  
  // Función para verificar cambios en los archivos
  const checkForChanges = () => {
    if (!fs.existsSync(logsDir)) return;
    
    const logFiles = fs.readdirSync(logsDir);
    
    logFiles.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const currentSize = stats.size;
      
      if (!lastSizes[file]) {
        lastSizes[file] = currentSize;
        return;
      }
      
      if (currentSize > lastSizes[file]) {
        // El archivo ha crecido, leer las nuevas líneas
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const newContent = content.slice(lastSizes[file]);
        const newLines = newContent.split('\n').filter(line => line.trim());
        
        if (newLines.length > 0) {
          console.log(colorize(`📄 ${file}:`, 'blue'));
          newLines.forEach(line => {
            console.log('   ' + formatLogEntry(line));
          });
          console.log('');
        }
        
        lastSizes[file] = currentSize;
      }
    });
  };
  
  // Verificar cambios cada segundo
  const interval = setInterval(checkForChanges, 1000);
  
  // Manejar Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n👋 Dejando de seguir logs...');
    process.exit(0);
  });
}

// Función para mostrar estadísticas de logs
function showLogStats() {
  const logsDir = path.join(rootDir, 'backend', 'logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('📂 No hay directorio de logs disponible.');
    return;
  }
  
  const logFiles = fs.readdirSync(logsDir);
  
  if (logFiles.length === 0) {
    console.log('📄 No hay archivos de log disponibles.');
    return;
  }
  
  console.log('📊 ESTADÍSTICAS DE LOGS\n');
  
  let totalSize = 0;
  const stats = {};
  
  logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    const fileStats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    totalSize += fileStats.size;
    
    const logType = file.split('-')[0];
    if (!stats[logType]) {
      stats[logType] = {
        files: 0,
        size: 0,
        entries: 0,
        latest: fileStats.mtime
      };
    }
    
    stats[logType].files++;
    stats[logType].size += fileStats.size;
    stats[logType].entries += lines.length;
    
    if (fileStats.mtime > stats[logType].latest) {
      stats[logType].latest = fileStats.mtime;
    }
  });
  
  console.log(`📁 Total de archivos: ${logFiles.length}`);
  console.log(`💾 Tamaño total: ${Math.round(totalSize / 1024)} KB\n`);
  
  Object.keys(stats).forEach(logType => {
    const stat = stats[logType];
    console.log(colorize(`📋 ${logType.toUpperCase()}:`, 'blue'));
    console.log(`   Archivos: ${stat.files}`);
    console.log(`   Entradas: ${stat.entries}`);
    console.log(`   Tamaño: ${Math.round(stat.size / 1024)} KB`);
    console.log(`   Último: ${stat.latest.toLocaleString()}`);
    console.log('');
  });
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'read';
  
  switch (command) {
    case 'read':
    case 'r':
      const logType = args[1] || 'all';
      const lines = parseInt(args[2]) || 50;
      readLogs(logType, lines);
      break;
    
    case 'follow':
    case 'f':
      followLogs();
      break;
    
    case 'stats':
    case 's':
      showLogStats();
      break;
    
    case 'help':
    case 'h':
      console.log('📚 AYUDA - Visor de Logs\n');
      console.log('Uso: npm run logs [comando] [opciones]\n');
      console.log('Comandos:');
      console.log('  read [tipo] [líneas]   Leer logs (por defecto: all 50)');
      console.log('  follow                 Seguir logs en tiempo real');
      console.log('  stats                  Mostrar estadísticas');
      console.log('  help                   Mostrar esta ayuda\n');
      console.log('Tipos de log: error, warn, info, debug, all');
      console.log('\nEjemplos:');
      console.log('  npm run logs                    # Últimas 50 líneas de todos los logs');
      console.log('  npm run logs read error         # Últimas 50 líneas de logs de error');
      console.log('  npm run logs read all 100       # Últimas 100 líneas de todos los logs');
      console.log('  npm run logs follow              # Seguir logs en tiempo real');
      console.log('  npm run logs stats               # Ver estadísticas');
      break;
    
    default:
      console.log(`❌ Comando desconocido: ${command}`);
      console.log('Usa "npm run logs help" para ver los comandos disponibles.');
  }
}

// Ejecutar
main();