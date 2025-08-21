#!/usr/bin/env node

/**
 * MCP RENDER - VOLUNTARIOS GT
 * ===========================
 * Sistema completo de gestión para servicios Render.com
 * Permite gestionar deployments, variables, logs, monitoreo y más.
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

/**
 * Clase principal del MCP Render
 */
class RenderMCP {
  constructor() {
    this.apiToken = process.env.RENDER_API_TOKEN;
    this.serviceId = process.env.RENDER_SERVICE_ID;
    this.serviceUrl = process.env.RENDER_SERVICE_URL;
    this.ownerId = process.env.RENDER_OWNER_ID;
    this.baseUrl = 'https://api.render.com/v1';
    this.apiTimeout = parseInt(process.env.API_TIMEOUT) || 30000;
    
    if (!this.apiToken) {
      throw new Error('❌ RENDER_API_TOKEN no está configurado en .env');
    }
    
    if (!this.serviceId) {
      throw new Error('❌ RENDER_SERVICE_ID no está configurado en .env');
    }
    
    console.log(chalk.blue('🚀 MCP Render inicializado para VoluntariosGT'));
    console.log(chalk.gray(`   Service ID: ${this.serviceId}`));
    console.log(chalk.gray(`   Service URL: ${this.serviceUrl}`));
  }

  /**
   * Realiza una petición HTTP a la API de Render
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      timeout: this.apiTimeout,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(chalk.red(`❌ Error en petición a ${endpoint}:`), error.message);
      throw error;
    }
  }

  // ==========================================================================
  // GESTIÓN DE SERVICIOS
  // ==========================================================================

  /**
   * Obtiene información del servicio
   */
  async getServiceInfo() {
    const spinner = ora('Obteniendo información del servicio...').start();
    
    try {
      const service = await this.makeRequest(`/services/${this.serviceId}`);
      spinner.succeed('✅ Información del servicio obtenida');
      
      console.log(chalk.yellow('\n📊 INFORMACIÓN DEL SERVICIO:'));
      console.log(chalk.white(`   Nombre: ${service.name}`));
      console.log(chalk.white(`   Tipo: ${service.type}`));
      
      // La estructura puede ser service.serviceDetails o directamente service
      const details = service.serviceDetails || service;
      const state = details.state || details.status || 'unknown';
      
      console.log(chalk.white(`   Estado: ${this.getStatusEmoji(state)} ${state}`));
      console.log(chalk.white(`   URL: ${details.url || service.url || 'N/A'}`));
      console.log(chalk.white(`   Region: ${details.region || 'N/A'}`));
      console.log(chalk.white(`   Plan: ${details.plan || details.serviceDetails?.plan || 'N/A'}`));
      console.log(chalk.white(`   Creado: ${service.createdAt ? new Date(service.createdAt).toLocaleString() : 'N/A'}`));
      console.log(chalk.white(`   Actualizado: ${service.updatedAt ? new Date(service.updatedAt).toLocaleString() : 'N/A'}`));
      
      return service;
    } catch (error) {
      spinner.fail('❌ Error obteniendo información del servicio');
      throw error;
    }
  }

  /**
   * Lista todos los servicios del usuario
   */
  async listAllServices() {
    const spinner = ora('Listando todos los servicios...').start();
    
    try {
      const services = await this.makeRequest('/services');
      spinner.succeed(`✅ Encontrados ${services.length} servicios`);
      
      console.log(chalk.yellow('\n📋 TODOS LOS SERVICIOS:'));
      services.forEach((service, index) => {
        console.log(chalk.white(`   ${index + 1}. ${service.name}`));
        console.log(chalk.gray(`      ID: ${service.id}`));
        console.log(chalk.gray(`      Tipo: ${service.type}`));
        console.log(chalk.gray(`      Estado: ${this.getStatusEmoji(service.serviceDetails?.state)} ${service.serviceDetails?.state}`));
        if (service.serviceDetails?.url) {
          console.log(chalk.gray(`      URL: ${service.serviceDetails.url}`));
        }
        console.log('');
      });
      
      return services;
    } catch (error) {
      spinner.fail('❌ Error listando servicios');
      throw error;
    }
  }

  /**
   * Reinicia el servicio
   */
  async restartService() {
    const spinner = ora('Reiniciando servicio...').start();
    
    try {
      await this.makeRequest(`/services/${this.serviceId}/restart`, {
        method: 'POST'
      });
      
      spinner.succeed('✅ Servicio reiniciado exitosamente');
      console.log(chalk.green('🔄 El servicio se está reiniciando. Esto puede tomar unos minutos.'));
      
      return true;
    } catch (error) {
      spinner.fail('❌ Error reiniciando servicio');
      throw error;
    }
  }

  /**
   * Suspende el servicio
   */
  async suspendService() {
    const spinner = ora('Suspendiendo servicio...').start();
    
    try {
      await this.makeRequest(`/services/${this.serviceId}/suspend`, {
        method: 'POST'
      });
      
      spinner.succeed('✅ Servicio suspendido');
      console.log(chalk.yellow('⏸️ El servicio ha sido suspendido'));
      
      return true;
    } catch (error) {
      spinner.fail('❌ Error suspendiendo servicio');
      throw error;
    }
  }

  /**
   * Reanuda el servicio
   */
  async resumeService() {
    const spinner = ora('Reanudando servicio...').start();
    
    try {
      await this.makeRequest(`/services/${this.serviceId}/resume`, {
        method: 'POST'
      });
      
      spinner.succeed('✅ Servicio reanudado');
      console.log(chalk.green('▶️ El servicio ha sido reanudado'));
      
      return true;
    } catch (error) {
      spinner.fail('❌ Error reanudando servicio');
      throw error;
    }
  }

  // ==========================================================================
  // GESTIÓN DE DEPLOYMENTS
  // ==========================================================================

  /**
   * Lista los deployments del servicio
   */
  async listDeployments(limit = 10) {
    const spinner = ora('Obteniendo historial de deployments...').start();
    
    try {
      const deployments = await this.makeRequest(`/services/${this.serviceId}/deploys?limit=${limit}`);
      spinner.succeed(`✅ Obtenidos ${deployments.length} deployments`);
      
      console.log(chalk.yellow('\n🚀 HISTORIAL DE DEPLOYMENTS:'));
      deployments.forEach((deploy, index) => {
        const deployId = deploy.id || `deploy-${index + 1}`;
        const deployStatus = deploy.status || 'unknown';
        const date = deploy.createdAt ? new Date(deploy.createdAt).toLocaleString() : 'Fecha desconocida';
        const status = this.getDeployStatusEmoji(deployStatus);
        
        console.log(chalk.white(`   ${index + 1}. ${deployId}`));
        console.log(chalk.gray(`      Estado: ${status} ${deployStatus}`));
        console.log(chalk.gray(`      Fecha: ${date}`));
        console.log(chalk.gray(`      Commit: ${deploy.commit?.message || deploy.commitMessage || 'N/A'}`));
        if (deploy.commit?.id || deploy.commitId) {
          const commitId = deploy.commit?.id || deploy.commitId;
          console.log(chalk.gray(`      SHA: ${commitId.substring(0, 8)}`));
        }
        console.log('');
      });
      
      return deployments;
    } catch (error) {
      spinner.fail('❌ Error obteniendo deployments');
      throw error;
    }
  }

  /**
   * Obtiene el deployment más reciente
   */
  async getLatestDeployment() {
    const deployments = await this.listDeployments(1);
    return deployments[0] || null;
  }

  /**
   * Crea un nuevo deployment manual
   */
  async createDeployment() {
    const spinner = ora('Iniciando nuevo deployment...').start();
    
    try {
      const deployment = await this.makeRequest(`/services/${this.serviceId}/deploys`, {
        method: 'POST'
      });
      
      spinner.succeed('✅ Deployment iniciado');
      console.log(chalk.green(`🚀 Nuevo deployment creado: ${deployment.id}`));
      console.log(chalk.blue('💡 Puedes monitorear el progreso con: npm run logs'));
      
      return deployment;
    } catch (error) {
      spinner.fail('❌ Error creando deployment');
      throw error;
    }
  }

  // ==========================================================================
  // GESTIÓN DE VARIABLES DE ENTORNO
  // ==========================================================================

  /**
   * Lista las variables de entorno del servicio
   */
  async listEnvironmentVariables() {
    const spinner = ora('Obteniendo variables de entorno...').start();
    
    try {
      const envVars = await this.makeRequest(`/services/${this.serviceId}/env-vars`);
      spinner.succeed(`✅ Obtenidas ${envVars.length} variables de entorno`);
      
      console.log(chalk.yellow('\n🔧 VARIABLES DE ENTORNO:'));
      envVars.forEach((envVar, index) => {
        const key = envVar.key || envVar.name || `var-${index + 1}`;
        const value = envVar.value || envVar.val || '';
        
        console.log(chalk.white(`   ${index + 1}. ${key}`));
        console.log(chalk.gray(`      Valor: ${this.maskSensitiveValue(key, value)}`));
        console.log('');
      });
      
      return envVars;
    } catch (error) {
      spinner.fail('❌ Error obteniendo variables de entorno');
      throw error;
    }
  }

  /**
   * Actualiza una variable de entorno
   */
  async updateEnvironmentVariable(key, value) {
    const spinner = ora(`Actualizando variable ${key}...`).start();
    
    try {
      const envVar = await this.makeRequest(`/services/${this.serviceId}/env-vars/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      });
      
      spinner.succeed(`✅ Variable ${key} actualizada`);
      console.log(chalk.green(`🔧 ${key} = ${this.maskSensitiveValue(key, value)}`));
      
      return envVar;
    } catch (error) {
      spinner.fail(`❌ Error actualizando variable ${key}`);
      throw error;
    }
  }

  /**
   * Crea una nueva variable de entorno
   */
  async createEnvironmentVariable(key, value) {
    const spinner = ora(`Creando variable ${key}...`).start();
    
    try {
      const envVar = await this.makeRequest(`/services/${this.serviceId}/env-vars`, {
        method: 'POST',
        body: JSON.stringify({ key, value })
      });
      
      spinner.succeed(`✅ Variable ${key} creada`);
      console.log(chalk.green(`🔧 ${key} = ${this.maskSensitiveValue(key, value)}`));
      
      return envVar;
    } catch (error) {
      spinner.fail(`❌ Error creando variable ${key}`);
      throw error;
    }
  }

  /**
   * Elimina una variable de entorno
   */
  async deleteEnvironmentVariable(key) {
    const spinner = ora(`Eliminando variable ${key}...`).start();
    
    try {
      await this.makeRequest(`/services/${this.serviceId}/env-vars/${key}`, {
        method: 'DELETE'
      });
      
      spinner.succeed(`✅ Variable ${key} eliminada`);
      console.log(chalk.yellow(`🗑️ Variable ${key} ha sido eliminada`));
      
      return true;
    } catch (error) {
      spinner.fail(`❌ Error eliminando variable ${key}`);
      throw error;
    }
  }

  // ==========================================================================
  // MONITOREO Y LOGS
  // ==========================================================================

  /**
   * Obtiene logs del servicio
   */
  async getLogs(limit = 100) {
    const spinner = ora('Obteniendo logs del servicio...').start();
    
    try {
      // Nota: La API de Render para logs puede requerir WebSocket o diferentes endpoints
      // Esta implementación es básica y puede necesitar ajustes
      const logs = await this.makeRequest(`/services/${this.serviceId}/logs?limit=${limit}`);
      spinner.succeed(`✅ Obtenidos logs del servicio`);
      
      console.log(chalk.yellow('\n📝 LOGS DEL SERVICIO:'));
      console.log(chalk.gray('═'.repeat(80)));
      
      if (Array.isArray(logs)) {
        logs.forEach(log => {
          const timestamp = new Date(log.timestamp).toLocaleString();
          console.log(chalk.gray(`[${timestamp}] ${log.message}`));
        });
      } else if (typeof logs === 'string') {
        console.log(logs);
      }
      
      console.log(chalk.gray('═'.repeat(80)));
      
      return logs;
    } catch (error) {
      spinner.fail('❌ Error obteniendo logs');
      console.log(chalk.yellow('💡 Tip: Los logs pueden requerir acceso directo al dashboard de Render'));
      throw error;
    }
  }

  /**
   * Verifica el estado de salud del servicio
   */
  async healthCheck() {
    const spinner = ora('Verificando estado de salud...').start();
    
    try {
      // Verificar el endpoint de salud del servicio
      const healthUrl = `${this.serviceUrl}/health`;
      const response = await fetch(healthUrl, { timeout: 10000 });
      
      if (response.ok) {
        spinner.succeed('✅ Servicio saludable');
        console.log(chalk.green('💚 El servicio está funcionando correctamente'));
        
        const data = await response.text();
        if (data) {
          console.log(chalk.gray(`Respuesta: ${data}`));
        }
        
        return { status: 'healthy', response: data };
      } else {
        spinner.warn(`⚠️ Servicio responde con código ${response.status}`);
        console.log(chalk.yellow(`🔍 Estado HTTP: ${response.status}`));
        
        return { status: 'unhealthy', code: response.status };
      }
    } catch (error) {
      spinner.fail('❌ Servicio no accesible');
      console.log(chalk.red(`🚨 Error: ${error.message}`));
      
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Obtiene métricas básicas del servicio
   */
  async getMetrics() {
    const spinner = ora('Obteniendo métricas del servicio...').start();
    
    try {
      const service = await this.makeRequest(`/services/${this.serviceId}`);
      const latest = await this.getLatestDeployment();
      const health = await this.healthCheck();
      
      spinner.succeed('✅ Métricas obtenidas');
      
      console.log(chalk.yellow('\n📊 MÉTRICAS DEL SERVICIO:'));
      console.log(chalk.white(`   Estado: ${this.getStatusEmoji(service.serviceDetails?.state)} ${service.serviceDetails?.state}`));
      console.log(chalk.white(`   Plan: ${service.serviceDetails?.plan || 'N/A'}`));
      console.log(chalk.white(`   Región: ${service.serviceDetails?.region || 'N/A'}`));
      console.log(chalk.white(`   Último deploy: ${latest ? new Date(latest.createdAt).toLocaleString() : 'N/A'}`));
      console.log(chalk.white(`   Estado deploy: ${latest ? this.getDeployStatusEmoji(latest.status) + ' ' + latest.status : 'N/A'}`));
      console.log(chalk.white(`   Salud: ${health.status === 'healthy' ? '💚 Saludable' : '🔴 Problemas'}`));
      
      return {
        service,
        latestDeployment: latest,
        health
      };
    } catch (error) {
      spinner.fail('❌ Error obteniendo métricas');
      throw error;
    }
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  /**
   * Obtiene emoji para el estado del servicio
   */
  getStatusEmoji(status) {
    const statusMap = {
      'available': '🟢',
      'building': '🔄',
      'deploy_failed': '🔴',
      'suspended': '⏸️',
      'pre_deploy_in_progress': '🔄',
      'build_failed': '🔴',
      'updating': '🔄'
    };
    return statusMap[status] || '⚪';
  }

  /**
   * Obtiene emoji para el estado del deployment
   */
  getDeployStatusEmoji(status) {
    const statusMap = {
      'created': '🔄',
      'build_in_progress': '🔨',
      'build_successful': '✅',
      'build_failed': '❌',
      'update_in_progress': '🔄',
      'live': '🟢',
      'deactivated': '⏸️',
      'canceled': '🚫'
    };
    return statusMap[status] || '⚪';
  }

  /**
   * Enmascara valores sensibles
   */
  maskSensitiveValue(key, value) {
    if (!key || !value) return value || '';
    
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'api'];
    const isSensitive = sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
    
    if (isSensitive && value && value.length > 8) {
      return `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
    }
    
    return value;
  }

  // ==========================================================================
  // COMANDOS AVANZADOS
  // ==========================================================================

  /**
   * Sincroniza variables de entorno desde el .env local
   */
  async syncEnvironmentVariables(envFilePath = '../backend/.env') {
    const spinner = ora('Sincronizando variables de entorno...').start();
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const fullPath = path.resolve(__dirname, envFilePath);
      const envContent = fs.readFileSync(fullPath, 'utf8');
      
      const localVars = {};
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          localVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      const remoteVars = await this.makeRequest(`/services/${this.serviceId}/env-vars`);
      const remoteKeys = new Set(remoteVars.map(v => v.key));
      
      let updated = 0;
      let created = 0;
      
      for (const [key, value] of Object.entries(localVars)) {
        if (remoteKeys.has(key)) {
          await this.updateEnvironmentVariable(key, value);
          updated++;
        } else {
          await this.createEnvironmentVariable(key, value);
          created++;
        }
      }
      
      spinner.succeed(`✅ Sincronización completa: ${created} creadas, ${updated} actualizadas`);
      
      return { created, updated };
    } catch (error) {
      spinner.fail('❌ Error sincronizando variables');
      throw error;
    }
  }

  /**
   * Rollback al deployment anterior
   */
  async rollback() {
    const spinner = ora('Buscando deployment anterior...').start();
    
    try {
      const deployments = await this.listDeployments(5);
      const liveDeployments = deployments.filter(d => d.status === 'live');
      
      if (liveDeployments.length < 2) {
        spinner.fail('❌ No hay deployment anterior disponible para rollback');
        return false;
      }
      
      const previousDeploy = liveDeployments[1];
      spinner.text = `Haciendo rollback a ${previousDeploy.id}...`;
      
      // Nota: Render puede no tener API directa para rollback
      // Alternativa: crear nuevo deployment desde el commit anterior
      console.log(chalk.yellow('⚠️ El rollback automático puede no estar disponible en Render API'));
      console.log(chalk.blue(`💡 Deployment anterior: ${previousDeploy.id}`));
      console.log(chalk.blue(`💡 Commit: ${previousDeploy.commit?.id || 'N/A'}`));
      
      spinner.succeed('ℹ️ Información de rollback obtenida');
      
      return previousDeploy;
    } catch (error) {
      spinner.fail('❌ Error en rollback');
      throw error;
    }
  }
}

// =============================================================================
// EXPORTACIÓN Y CLI
// =============================================================================

export default RenderMCP;

// Si se ejecuta directamente
const isMainModule = process.argv[1] && (
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
  import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`
);

if (isMainModule) {
  async function runCLI() {
    try {
      const render = new RenderMCP();
      
      const command = process.argv[2];
      const args = process.argv.slice(3);
      
      switch (command) {
        case 'status':
        case 'info':
          await render.getServiceInfo();
          break;
          
        case 'list':
          await render.listAllServices();
          break;
          
        case 'restart':
          await render.restartService();
          break;
          
        case 'suspend':
          await render.suspendService();
          break;
          
        case 'resume':
          await render.resumeService();
          break;
          
        case 'deploy':
          await render.createDeployment();
          break;
          
        case 'deployments':
          await render.listDeployments(parseInt(args[0]) || 10);
          break;
          
        case 'env':
          await render.listEnvironmentVariables();
          break;
          
        case 'set-env':
          if (args.length < 2) {
            console.log(chalk.red('❌ Uso: node index.js set-env KEY VALUE'));
            process.exit(1);
          }
          await render.createEnvironmentVariable(args[0], args[1]);
          break;
          
        case 'update-env':
          if (args.length < 2) {
            console.log(chalk.red('❌ Uso: node index.js update-env KEY VALUE'));
            process.exit(1);
          }
          await render.updateEnvironmentVariable(args[0], args[1]);
          break;
          
        case 'delete-env':
          if (args.length < 1) {
            console.log(chalk.red('❌ Uso: node index.js delete-env KEY'));
            process.exit(1);
          }
          await render.deleteEnvironmentVariable(args[0]);
          break;
          
        case 'logs':
          await render.getLogs(parseInt(args[0]) || 100);
          break;
          
        case 'health':
          await render.healthCheck();
          break;
          
        case 'metrics':
          await render.getMetrics();
          break;
          
        case 'sync-env':
          await render.syncEnvironmentVariables(args[0]);
          break;
          
        case 'rollback':
          await render.rollback();
          break;
          
        default:
          console.log(chalk.blue('🚀 MCP Render - VoluntariosGT'));
          console.log(chalk.white('\n📋 Comandos disponibles:'));
          console.log(chalk.gray('   status          - Información del servicio'));
          console.log(chalk.gray('   list            - Listar todos los servicios'));
          console.log(chalk.gray('   restart         - Reiniciar servicio'));
          console.log(chalk.gray('   suspend         - Suspender servicio'));
          console.log(chalk.gray('   resume          - Reanudar servicio'));
          console.log(chalk.gray('   deploy          - Crear nuevo deployment'));
          console.log(chalk.gray('   deployments [N] - Listar deployments (últimos N)'));
          console.log(chalk.gray('   env             - Listar variables de entorno'));
          console.log(chalk.gray('   set-env K V     - Crear variable de entorno'));
          console.log(chalk.gray('   update-env K V  - Actualizar variable de entorno'));
          console.log(chalk.gray('   delete-env K    - Eliminar variable de entorno'));
          console.log(chalk.gray('   logs [N]        - Obtener logs (últimas N líneas)'));
          console.log(chalk.gray('   health          - Verificar salud del servicio'));
          console.log(chalk.gray('   metrics         - Obtener métricas del servicio'));
          console.log(chalk.gray('   sync-env [PATH] - Sincronizar .env local'));
          console.log(chalk.gray('   rollback        - Información para rollback'));
          break;
      }
    } catch (error) {
      console.error(chalk.red('❌ Error ejecutando comando:'), error.message);
      process.exit(1);
    }
  }
  
  runCLI();
}