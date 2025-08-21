#!/usr/bin/env node

/**
 * SCRIPT DE DEPLOYMENT AUTOMATIZADO
 * =================================
 * Maneja deployments con verificaciones y notificaciones
 */

import RenderMCP from './index.js';
import chalk from 'chalk';
import ora from 'ora';

class DeploymentManager {
  constructor() {
    this.render = new RenderMCP();
  }

  /**
   * Ejecuta un deployment completo con verificaciones
   */
  async deploy() {
    console.log(chalk.blue('🚀 INICIANDO DEPLOYMENT AUTOMATIZADO - VOLUNTARIOS GT'));
    console.log(chalk.gray('═'.repeat(60)));

    try {
      // 1. Verificar estado actual
      await this.preDeploymentChecks();
      
      // 2. Crear deployment
      const deployment = await this.createDeployment();
      
      // 3. Monitorear progreso
      await this.monitorDeployment(deployment.id);
      
      // 4. Verificaciones post-deployment
      await this.postDeploymentChecks();
      
      console.log(chalk.green('\n✅ DEPLOYMENT COMPLETADO EXITOSAMENTE'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ DEPLOYMENT FALLÓ:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Verificaciones previas al deployment
   */
  async preDeploymentChecks() {
    console.log(chalk.yellow('\n🔍 VERIFICACIONES PRE-DEPLOYMENT:'));
    
    // Verificar estado del servicio
    const service = await this.render.getServiceInfo();
    
    if (service.serviceDetails?.state === 'suspended') {
      throw new Error('El servicio está suspendido. Reanúdalo antes de hacer deployment.');
    }
    
    // Verificar último deployment
    const latest = await this.render.getLatestDeployment();
    if (latest && latest.status === 'build_in_progress') {
      throw new Error('Ya hay un deployment en progreso. Espera a que termine.');
    }
    
    // Verificar salud del servicio
    const health = await this.render.healthCheck();
    console.log(chalk.green(`   ✓ Estado del servicio: ${service.serviceDetails?.state}`));
    console.log(chalk.green(`   ✓ Salud del servicio: ${health.status}`));
  }

  /**
   * Crea el deployment
   */
  async createDeployment() {
    console.log(chalk.yellow('\n🚀 CREANDO DEPLOYMENT:'));
    const deployment = await this.render.createDeployment();
    
    console.log(chalk.blue(`   📦 Deployment ID: ${deployment.id}`));
    console.log(chalk.blue(`   ⏰ Iniciado: ${new Date(deployment.createdAt).toLocaleString()}`));
    
    return deployment;
  }

  /**
   * Monitorea el progreso del deployment
   */
  async monitorDeployment(deploymentId, maxWaitTime = 10 * 60 * 1000) {
    console.log(chalk.yellow('\n⏳ MONITOREANDO DEPLOYMENT:'));
    
    const startTime = Date.now();
    const spinner = ora('Esperando inicio del build...').start();
    
    let lastStatus = null;
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const deployments = await this.render.listDeployments(1);
        const current = deployments[0];
        
        if (current.id === deploymentId) {
          if (current.status !== lastStatus) {
            lastStatus = current.status;
            const emoji = this.render.getDeployStatusEmoji(current.status);
            spinner.text = `${emoji} ${current.status}`;
            
            if (current.status === 'live') {
              spinner.succeed('✅ Deployment completado y en vivo');
              return current;
            }
            
            if (current.status === 'build_failed' || current.status === 'canceled') {
              spinner.fail(`❌ Deployment falló: ${current.status}`);
              throw new Error(`Deployment falló con estado: ${current.status}`);
            }
          }
        }
        
        // Esperar 10 segundos antes de la siguiente verificación
        await new Promise(resolve => setTimeout(resolve, 10000));
        
      } catch (error) {
        spinner.fail('❌ Error monitoreando deployment');
        throw error;
      }
    }
    
    spinner.fail('⏰ Timeout esperando deployment');
    throw new Error('El deployment tardó demasiado tiempo');
  }

  /**
   * Verificaciones post-deployment
   */
  async postDeploymentChecks() {
    console.log(chalk.yellow('\n✅ VERIFICACIONES POST-DEPLOYMENT:'));
    
    // Esperar un poco para que el servicio se estabilice
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verificar salud
    const health = await this.render.healthCheck();
    if (health.status !== 'healthy') {
      console.log(chalk.yellow('⚠️ El servicio no está completamente saludable aún'));
    } else {
      console.log(chalk.green('   ✓ Servicio saludable'));
    }
    
    // Verificar que el servicio responde
    try {
      const response = await fetch(this.render.serviceUrl, { timeout: 10000 });
      if (response.ok) {
        console.log(chalk.green('   ✓ Servicio responde correctamente'));
      } else {
        console.log(chalk.yellow(`   ⚠️ Servicio responde con código ${response.status}`));
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Error verificando servicio: ${error.message}`));
    }
  }

  /**
   * Rollback automático en caso de fallo
   */
  async autoRollback() {
    console.log(chalk.yellow('\n🔄 INICIANDO ROLLBACK AUTOMÁTICO:'));
    
    try {
      const previousDeploy = await this.render.rollback();
      
      if (previousDeploy) {
        console.log(chalk.blue(`   📦 Deployment anterior: ${previousDeploy.id}`));
        console.log(chalk.blue(`   ⏰ Fecha: ${new Date(previousDeploy.createdAt).toLocaleString()}`));
        console.log(chalk.yellow('   💡 Para hacer rollback manual, contacta al equipo de Render'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error en rollback automático:'), error.message);
    }
  }
}

// Exportar para uso como módulo
export default DeploymentManager;

// Ejecutar si se llama directamente
const isMainModule = process.argv[1] && (
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
  import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`
);

if (isMainModule) {
  async function runDeploymentCLI() {
    try {
      const manager = new DeploymentManager();
      
      const command = process.argv[2];
      
      switch (command) {
        case 'deploy':
          await manager.deploy();
          break;
          
        case 'rollback':
          await manager.autoRollback();
          break;
          
        default:
          console.log(chalk.blue('🚀 Deployment Manager - VoluntariosGT'));
          console.log(chalk.white('\n📋 Comandos disponibles:'));
          console.log(chalk.gray('   deploy   - Ejecutar deployment completo'));
          console.log(chalk.gray('   rollback - Información para rollback'));
          break;
      }
    } catch (error) {
      console.error(chalk.red('❌ Error en deployment manager:'), error.message);
      process.exit(1);
    }
  }
  
  runDeploymentCLI();
}