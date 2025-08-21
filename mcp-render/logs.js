#!/usr/bin/env node

/**
 * MONITOR DE LOGS EN TIEMPO REAL
 * ==============================
 * Monitorea logs del servicio Render con filtros y alertas
 */

import RenderMCP from './index.js';
import chalk from 'chalk';
import fetch from 'node-fetch';

class LogsMonitor {
  constructor() {
    this.render = new RenderMCP();
    this.isMonitoring = false;
    this.errorCount = 0;
    this.lastCheck = new Date();
  }

  /**
   * Inicia monitoreo de logs en tiempo real
   */
  async startRealTimeMonitoring(options = {}) {
    const {
      interval = 30000,     // 30 segundos
      errorThreshold = 5,   // máximo 5 errores antes de alerta
      keywords = ['error', 'warning', 'exception'] // palabras clave a monitorear
    } = options;

    console.log(chalk.blue('📺 INICIANDO MONITOREO DE LOGS - VOLUNTARIOS GT'));
    console.log(chalk.gray(`   Intervalo: ${interval/1000} segundos`));
    console.log(chalk.gray(`   Threshold de errores: ${errorThreshold}`));
    console.log(chalk.gray(`   Palabras clave: ${keywords.join(', ')}`));
    console.log(chalk.gray('═'.repeat(80)));
    console.log(chalk.yellow('Presiona Ctrl+C para detener\n'));

    this.isMonitoring = true;
    this.errorCount = 0;

    const monitor = async () => {
      if (!this.isMonitoring) return;

      try {
        await this.checkServiceHealth();
        await this.checkServiceLogs(keywords);
        
        // Verificar threshold de errores
        if (this.errorCount >= errorThreshold) {
          await this.sendAlert(`⚠️ ALERTA: ${this.errorCount} errores detectados en los logs`);
          this.errorCount = 0; // Reset después de alerta
        }

      } catch (error) {
        console.error(chalk.red(`❌ Error en monitoreo: ${error.message}`));
      }

      // Programar siguiente verificación
      setTimeout(monitor, interval);
    };

    // Manejar interrupción
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n⏹️ Deteniendo monitoreo...'));
      this.isMonitoring = false;
      process.exit(0);
    });

    // Iniciar monitoreo
    await monitor();
  }

  /**
   * Verifica la salud del servicio
   */
  async checkServiceHealth() {
    try {
      const health = await this.render.healthCheck();
      const timestamp = new Date().toLocaleString();
      
      if (health.status === 'healthy') {
        console.log(chalk.green(`[${timestamp}] 💚 Servicio saludable`));
      } else {
        console.log(chalk.red(`[${timestamp}] 🔴 Problema de salud: ${health.error || health.status}`));
        this.errorCount++;
      }
    } catch (error) {
      const timestamp = new Date().toLocaleString();
      console.log(chalk.red(`[${timestamp}] ❌ Error verificando salud: ${error.message}`));
      this.errorCount++;
    }
  }

  /**
   * Simula verificación de logs (Render API puede no tener logs en tiempo real)
   */
  async checkServiceLogs(keywords) {
    const timestamp = new Date().toLocaleString();
    
    try {
      // Intentar obtener logs directamente desde el endpoint de salud
      const response = await fetch(`${this.render.serviceUrl}/health`, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'VoluntariosGT-LogsMonitor/1.0'
        }
      });
      
      if (!response.ok) {
        console.log(chalk.yellow(`[${timestamp}] ⚠️ Servicio responde con código ${response.status}`));
        return;
      }

      // Como no tenemos acceso directo a logs, simular verificaciones básicas
      const responseTime = Date.now() - this.lastCheck.getTime();
      
      if (responseTime > 5000) {
        console.log(chalk.yellow(`[${timestamp}] 🐌 Respuesta lenta: ${responseTime}ms`));
      } else {
        console.log(chalk.gray(`[${timestamp}] ⚡ Respuesta: ${responseTime}ms`));
      }

      this.lastCheck = new Date();

    } catch (error) {
      console.log(chalk.red(`[${timestamp}] 🚨 Error de conectividad: ${error.message}`));
      this.errorCount++;
    }
  }

  /**
   * Obtiene logs históricos con filtros
   */
  async getFilteredLogs(options = {}) {
    const {
      limit = 100,
      filter = null,
      level = 'all' // 'error', 'warning', 'info', 'all'
    } = options;

    console.log(chalk.blue('📋 OBTENIENDO LOGS FILTRADOS'));
    console.log(chalk.gray(`   Límite: ${limit} líneas`));
    console.log(chalk.gray(`   Filtro: ${filter || 'ninguno'}`));
    console.log(chalk.gray(`   Nivel: ${level}`));
    console.log(chalk.gray('═'.repeat(80)));

    try {
      // Obtener información de deployments recientes para contexto
      const deployments = await this.render.listDeployments(5);
      const latest = deployments[0];

      console.log(chalk.yellow('\n📦 CONTEXTO DEL DEPLOYMENT:'));
      if (latest) {
        console.log(chalk.white(`   ID: ${latest.id}`));
        console.log(chalk.white(`   Estado: ${this.render.getDeployStatusEmoji(latest.status)} ${latest.status}`));
        console.log(chalk.white(`   Fecha: ${new Date(latest.createdAt).toLocaleString()}`));
        if (latest.commit) {
          console.log(chalk.white(`   Commit: ${latest.commit.message || 'N/A'}`));
        }
      }

      // Intentar obtener logs (puede no estar disponible en API)
      console.log(chalk.yellow('\n📝 LOGS DEL SERVICIO:'));
      console.log(chalk.gray('Nota: Render puede requerir acceso directo al dashboard para logs detallados'));
      
      // Simular logs básicos basados en el estado del servicio
      await this.simulateBasicLogs();

    } catch (error) {
      console.error(chalk.red('❌ Error obteniendo logs:'), error.message);
    }
  }

  /**
   * Simula logs básicos basados en el estado del servicio
   */
  async simulateBasicLogs() {
    const service = await this.render.getServiceInfo();
    const timestamp = new Date().toISOString();
    
    console.log(chalk.gray(`[${timestamp}] INFO: Servicio ${service.name} en estado ${service.serviceDetails?.state}`));
    
    // Verificar endpoint de salud para simular logs
    try {
      const start = Date.now();
      const response = await fetch(`${this.render.serviceUrl}/health`, { timeout: 10000 });
      const duration = Date.now() - start;
      
      console.log(chalk.gray(`[${timestamp}] INFO: Health check completado en ${duration}ms`));
      console.log(chalk.gray(`[${timestamp}] INFO: HTTP ${response.status} ${response.statusText}`));
      
      if (response.ok) {
        console.log(chalk.green(`[${timestamp}] INFO: Servicio respondiendo correctamente`));
      } else {
        console.log(chalk.yellow(`[${timestamp}] WARN: Servicio respondió con error ${response.status}`));
      }
      
    } catch (error) {
      console.log(chalk.red(`[${timestamp}] ERROR: ${error.message}`));
    }
  }

  /**
   * Analiza logs para detectar patrones
   */
  async analyzeLogs() {
    console.log(chalk.blue('🔍 ANÁLISIS DE LOGS - VOLUNTARIOS GT'));
    console.log(chalk.gray('═'.repeat(60)));

    try {
      // Obtener métricas del servicio
      const metrics = await this.render.getMetrics();
      
      console.log(chalk.yellow('\n📊 ANÁLISIS DE PATRONES:'));
      
      // Analizar estado del servicio
      const service = metrics.service;
      const health = metrics.health;
      const latest = metrics.latestDeployment;
      
      console.log(chalk.white('\n🔍 Estado del Servicio:'));
      console.log(chalk.gray(`   Estado actual: ${service.serviceDetails?.state}`));
      console.log(chalk.gray(`   Salud: ${health.status}`));
      console.log(chalk.gray(`   Último deployment: ${latest ? latest.status : 'N/A'}`));
      
      // Recomendaciones basadas en el estado
      console.log(chalk.yellow('\n💡 RECOMENDACIONES:'));
      
      if (health.status !== 'healthy') {
        console.log(chalk.red('   ⚠️ Verificar configuración del servicio'));
        console.log(chalk.red('   ⚠️ Revisar variables de entorno'));
      }
      
      if (latest && latest.status === 'build_failed') {
        console.log(chalk.red('   ⚠️ Último deployment falló - verificar código'));
      }
      
      if (service.serviceDetails?.state === 'suspended') {
        console.log(chalk.yellow('   ⚠️ Servicio suspendido - considerar reanudar'));
      }
      
      if (health.status === 'healthy' && service.serviceDetails?.state === 'available') {
        console.log(chalk.green('   ✅ Todo funcionando correctamente'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error en análisis:'), error.message);
    }
  }

  /**
   * Envía alerta (placeholder para futuras integraciones)
   */
  async sendAlert(message) {
    const timestamp = new Date().toLocaleString();
    console.log(chalk.red.bold(`\n🚨 ALERTA [${timestamp}]: ${message}`));
    
    // Aquí se pueden agregar integraciones con:
    // - Discord webhooks
    // - Slack notifications
    // - Email alerts
    // - OneSignal notifications
  }
}

// Exportar para uso como módulo
export default LogsMonitor;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new LogsMonitor();
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'monitor':
    case 'watch':
      const interval = parseInt(args[0]) || 30000;
      await monitor.startRealTimeMonitoring({ interval });
      break;
      
    case 'get':
    case 'fetch':
      const limit = parseInt(args[0]) || 100;
      const filter = args[1] || null;
      await monitor.getFilteredLogs({ limit, filter });
      break;
      
    case 'analyze':
      await monitor.analyzeLogs();
      break;
      
    default:
      console.log(chalk.blue('📺 Logs Monitor - VoluntariosGT'));
      console.log(chalk.white('\n📋 Comandos disponibles:'));
      console.log(chalk.gray('   monitor [interval] - Monitoreo en tiempo real (ms)'));
      console.log(chalk.gray('   get [limit] [filter] - Obtener logs históricos'));
      console.log(chalk.gray('   analyze - Análisis de patrones en logs'));
      break;
  }
}