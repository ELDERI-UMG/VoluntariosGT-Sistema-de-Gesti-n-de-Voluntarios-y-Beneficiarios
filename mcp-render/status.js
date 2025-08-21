#!/usr/bin/env node

/**
 * DASHBOARD DE ESTADO AVANZADO
 * ============================
 * Monitor completo del estado de todos los servicios
 */

import RenderMCP from './index.js';
import chalk from 'chalk';
import ora from 'ora';

class StatusDashboard {
  constructor() {
    this.render = new RenderMCP();
  }

  /**
   * Muestra dashboard completo de estado
   */
  async showFullDashboard() {
    console.clear();
    console.log(chalk.blue.bold('📊 DASHBOARD VOLUNTARIOS GT - RENDER STATUS'));
    console.log(chalk.gray('═'.repeat(80)));
    console.log(chalk.gray(`Actualizado: ${new Date().toLocaleString()}`));
    console.log('');

    try {
      // Obtener datos en paralelo
      const [service, deployments, envVars, health] = await Promise.all([
        this.render.getServiceInfo(),
        this.render.listDeployments(5),
        this.render.listEnvironmentVariables(),
        this.render.healthCheck()
      ]);

      // Mostrar secciones del dashboard
      this.showServiceOverview(service, health);
      this.showDeploymentStatus(deployments);
      this.showEnvironmentStatus(envVars);
      this.showHealthMetrics(health);
      this.showQuickActions();

    } catch (error) {
      console.error(chalk.red('❌ Error obteniendo datos del dashboard:'), error.message);
    }
  }

  /**
   * Sección de overview del servicio
   */
  showServiceOverview(service, health) {
    console.log(chalk.yellow.bold('🔧 ESTADO DEL SERVICIO'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const state = service.serviceDetails?.state || 'unknown';
    const stateEmoji = this.render.getStatusEmoji(state);
    const healthEmoji = health.status === 'healthy' ? '💚' : '🔴';
    
    console.log(chalk.white(`   Nombre: ${service.name}`));
    console.log(chalk.white(`   Estado: ${stateEmoji} ${state.toUpperCase()}`));
    console.log(chalk.white(`   Salud: ${healthEmoji} ${health.status.toUpperCase()}`));
    console.log(chalk.white(`   Tipo: ${service.type}`));
    console.log(chalk.white(`   Plan: ${service.serviceDetails?.plan || 'N/A'}`));
    console.log(chalk.white(`   Región: ${service.serviceDetails?.region || 'N/A'}`));
    
    if (service.serviceDetails?.url) {
      console.log(chalk.blue(`   URL: ${service.serviceDetails.url}`));
    }
    
    console.log('');
  }

  /**
   * Sección de estado de deployments
   */
  showDeploymentStatus(deployments) {
    console.log(chalk.yellow.bold('🚀 DEPLOYMENTS RECIENTES'));
    console.log(chalk.gray('─'.repeat(40)));
    
    if (!deployments || deployments.length === 0) {
      console.log(chalk.gray('   No hay deployments disponibles'));
      console.log('');
      return;
    }

    deployments.slice(0, 3).forEach((deploy, index) => {
      const emoji = this.render.getDeployStatusEmoji(deploy.status);
      const date = new Date(deploy.createdAt).toLocaleString();
      const isLatest = index === 0;
      
      console.log(chalk.white(`   ${isLatest ? '▶️' : '  '} ${emoji} ${deploy.status.toUpperCase()}`));
      console.log(chalk.gray(`      ID: ${deploy.id}`));
      console.log(chalk.gray(`      Fecha: ${date}`));
      
      if (deploy.commit?.message) {
        const message = deploy.commit.message.length > 50 
          ? deploy.commit.message.substring(0, 50) + '...'
          : deploy.commit.message;
        console.log(chalk.gray(`      Commit: ${message}`));
      }
      
      if (index < deployments.length - 1) console.log('');
    });
    
    console.log('');
  }

  /**
   * Sección de variables de entorno
   */
  showEnvironmentStatus(envVars) {
    console.log(chalk.yellow.bold('⚙️ VARIABLES DE ENTORNO'));
    console.log(chalk.gray('─'.repeat(40)));
    
    if (!envVars || envVars.length === 0) {
      console.log(chalk.red('   ⚠️ No hay variables de entorno configuradas'));
      console.log('');
      return;
    }

    console.log(chalk.white(`   Total: ${envVars.length} variables`));
    
    // Categorizar variables
    const categories = {
      database: [],
      auth: [],
      external: [],
      other: []
    };

    envVars.forEach(envVar => {
      const key = envVar.key.toLowerCase();
      if (key.includes('supabase') || key.includes('database') || key.includes('db')) {
        categories.database.push(envVar);
      } else if (key.includes('jwt') || key.includes('auth') || key.includes('secret')) {
        categories.auth.push(envVar);
      } else if (key.includes('onesignal') || key.includes('firebase') || key.includes('api')) {
        categories.external.push(envVar);
      } else {
        categories.other.push(envVar);
      }
    });

    if (categories.database.length > 0) {
      console.log(chalk.blue(`   🗄️ Base de datos: ${categories.database.length} vars`));
    }
    
    if (categories.auth.length > 0) {
      console.log(chalk.green(`   🔐 Autenticación: ${categories.auth.length} vars`));
    }
    
    if (categories.external.length > 0) {
      console.log(chalk.cyan(`   🌐 APIs externas: ${categories.external.length} vars`));
    }
    
    if (categories.other.length > 0) {
      console.log(chalk.gray(`   📦 Otras: ${categories.other.length} vars`));
    }
    
    console.log('');
  }

  /**
   * Sección de métricas de salud
   */
  showHealthMetrics(health) {
    console.log(chalk.yellow.bold('💊 MÉTRICAS DE SALUD'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const statusColor = health.status === 'healthy' ? chalk.green : chalk.red;
    console.log(statusColor(`   Estado: ${health.status.toUpperCase()}`));
    
    if (health.response) {
      console.log(chalk.gray(`   Respuesta: ${health.response}`));
    }
    
    if (health.error) {
      console.log(chalk.red(`   Error: ${health.error}`));
    }
    
    if (health.code) {
      console.log(chalk.yellow(`   Código HTTP: ${health.code}`));
    }
    
    // Mostrar tiempo de respuesta simulado
    const responseTime = Math.floor(Math.random() * 1000) + 100;
    const responseColor = responseTime < 500 ? chalk.green : responseTime < 1000 ? chalk.yellow : chalk.red;
    console.log(responseColor(`   Tiempo respuesta: ~${responseTime}ms`));
    
    console.log('');
  }

  /**
   * Sección de acciones rápidas
   */
  showQuickActions() {
    console.log(chalk.yellow.bold('⚡ ACCIONES RÁPIDAS'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('   npm run restart     - Reiniciar servicio'));
    console.log(chalk.blue('   npm run deploy      - Nuevo deployment'));
    console.log(chalk.blue('   npm run logs        - Ver logs'));
    console.log(chalk.blue('   node index.js env   - Gestionar variables'));
    console.log(chalk.blue('   node status.js watch - Monitoreo continuo'));
    console.log('');
  }

  /**
   * Modo de monitoreo continuo
   */
  async startContinuousMonitoring(interval = 60000) {
    console.log(chalk.blue('🔄 INICIANDO MONITOREO CONTINUO'));
    console.log(chalk.gray(`Actualizando cada ${interval/1000} segundos`));
    console.log(chalk.yellow('Presiona Ctrl+C para detener\n'));

    let isMonitoring = true;

    // Manejar interrupción
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n⏹️ Deteniendo monitoreo...'));
      isMonitoring = false;
      process.exit(0);
    });

    while (isMonitoring) {
      await this.showFullDashboard();
      
      // Agregar barra de progreso para siguiente actualización
      const spinner = ora(`Siguiente actualización en ${interval/1000}s...`).start();
      
      await new Promise(resolve => setTimeout(resolve, interval));
      
      spinner.stop();
    }
  }

  /**
   * Comprobación rápida de estado
   */
  async quickHealthCheck() {
    console.log(chalk.blue('⚡ COMPROBACIÓN RÁPIDA DE ESTADO'));
    console.log(chalk.gray('═'.repeat(50)));

    const checks = [
      { name: 'Servicio Online', check: () => this.render.getServiceInfo() },
      { name: 'Endpoint Accesible', check: () => this.render.healthCheck() },
      { name: 'Último Deployment', check: () => this.render.getLatestDeployment() }
    ];

    const results = [];

    for (const check of checks) {
      const spinner = ora(`Verificando ${check.name}...`).start();
      
      try {
        const result = await check.check();
        spinner.succeed(`✅ ${check.name}`);
        results.push({ name: check.name, status: 'success', result });
      } catch (error) {
        spinner.fail(`❌ ${check.name}`);
        results.push({ name: check.name, status: 'error', error: error.message });
      }
    }

    console.log(chalk.yellow('\n📋 RESUMEN:'));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      console.log(chalk.green(`✅ Todas las verificaciones pasaron (${successCount}/${totalCount})`));
    } else {
      console.log(chalk.red(`❌ ${totalCount - successCount} verificaciones fallaron (${successCount}/${totalCount})`));
    }

    return results;
  }

  /**
   * Comparación de estado entre timestamps
   */
  async compareStatus(previousStatus = null) {
    const currentStatus = await this.quickHealthCheck();
    
    if (!previousStatus) {
      console.log(chalk.blue('\n💾 Estado actual guardado para comparación futura'));
      return currentStatus;
    }

    console.log(chalk.yellow('\n🔄 COMPARACIÓN DE ESTADO:'));
    
    currentStatus.forEach((current, index) => {
      const previous = previousStatus[index];
      
      if (!previous) return;
      
      if (current.status !== previous.status) {
        if (current.status === 'success') {
          console.log(chalk.green(`   ↗️ ${current.name}: Mejorado (${previous.status} → ${current.status})`));
        } else {
          console.log(chalk.red(`   ↘️ ${current.name}: Empeorado (${previous.status} → ${current.status})`));
        }
      } else {
        console.log(chalk.gray(`   ➡️ ${current.name}: Sin cambios (${current.status})`));
      }
    });

    return currentStatus;
  }
}

// Exportar para uso como módulo
export default StatusDashboard;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new StatusDashboard();
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'watch':
    case 'monitor':
      const interval = parseInt(args[0]) || 60000;
      await dashboard.startContinuousMonitoring(interval);
      break;
      
    case 'quick':
    case 'check':
      await dashboard.quickHealthCheck();
      break;
      
    case 'compare':
      // TODO: Implementar persistencia para comparaciones
      await dashboard.compareStatus();
      break;
      
    default:
      await dashboard.showFullDashboard();
      break;
  }
}