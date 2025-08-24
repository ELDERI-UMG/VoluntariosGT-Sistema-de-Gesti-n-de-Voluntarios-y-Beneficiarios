#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '../frontend/src');

console.log('🔧 Corrigiendo importaciones de COLORS...\n');

// Función para procesar archivos recursivamente
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

// Función para procesar un archivo individual
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Patrón para encontrar importaciones problemáticas
    const oldPattern = /import\s*{\s*([^}]*COLORS[^}]*)\s*}\s*from\s*['"][^'"]*\/constants\/config['"];?/g;
    
    let match;
    let hasChanges = false;
    
    while ((match = oldPattern.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim());
      
      const colorImports = imports.filter(imp => imp.includes('COLORS'));
      const otherImports = imports.filter(imp => !imp.includes('COLORS'));
      
      if (colorImports.length > 0 && otherImports.length > 0) {
        // Separar las importaciones
        const newImports = [
          `import { COLORS } from '../constants/colors';`,
          `import { ${otherImports.join(', ')} } from '../constants/config';`
        ].join('\n');
        
        content = content.replace(match[0], newImports);
        hasChanges = true;
      } else if (colorImports.length > 0) {
        // Solo COLORS, cambiar la ruta
        const newImport = `import { COLORS } from '../constants/colors';`;
        content = content.replace(match[0], newImport);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corregido: ${path.relative(frontendDir, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Ejecutar el script
try {
  processDirectory(frontendDir);
  console.log('\n🎉 ¡Importaciones corregidas exitosamente!');
} catch (error) {
  console.error('❌ Error ejecutando script:', error.message);
  process.exit(1);
}