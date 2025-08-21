#!/usr/bin/env node

/**
 * SUITE DE TESTING PARA MCP RENDER
 * =================================
 * Tests automáticos para verificar funcionamiento del MCP
 */

import RenderMCP from './index.js';
import chalk from 'chalk';
import ora from 'ora';

class RenderMCPTester {
  constructor() {
    this.render = new RenderMCP();
    this.testResults = [];
  }

  /**
   * Ejecuta toda la suite de tests
   */
  async runAllTests() {
    console.log(chalk.blue.bold('🧪 INICIANDO SUITE DE TESTS - MCP RENDER'));
    console.log(chalk.gray('═'.repeat(60)));
    console.log('');

    const tests = [
      { name: 'Conexión API', test: () => this.testAPIConnection() },
      { name: 'Info del Servicio', test: () => this.testServiceInfo() },
      { name: 'Health Check', test: () => this.testHealthCheck() },
      { name: 'Lista Deployments', test: () => this.testListDeployments() },
      { name: 'Variables de Entorno', test: () => this.testEnvironmentVariables() },
      { name: 'Métricas', test: () => this.testMetrics() }
    ];

    for (const test of tests) {
      await this.runSingleTest(test.name, test.test);
    }

    this.showTestSummary();
  }

  /**
   * Ejecuta un test individual
   */
  async runSingleTest(testName, testFunction) {
    const spinner = ora(`Ejecutando: ${testName}`).start();

    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;

      spinner.succeed(`✅ ${testName} (${duration}ms)`);
      this.testResults.push({
        name: testName,
        status: 'passed',
        duration,
        result
      });

    } catch (error) {
      spinner.fail(`❌ ${testName}`);
      console.log(chalk.red(`   Error: ${error.message}`));
      
      this.testResults.push({
        name: testName,
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Test de conexión básica a la API
   */
  async testAPIConnection() {
    try {
      await this.render.makeRequest('/services', { method: 'GET' });
      return { connection: 'success' };
    } catch (error) {
      throw new Error(`Fallo de conexión API: ${error.message}`);
    }
  }

  /**
   * Test de obtención de información del servicio
   */
  async testServiceInfo() {
    const service = await this.render.getServiceInfo();
    
    if (!service.id) {
      throw new Error('Service ID no encontrado en respuesta');
    }

    if (!service.name) {
      throw new Error('Service name no encontrado en respuesta');
    }

    if (service.id !== this.render.serviceId) {
      throw new Error(`Service ID mismatch: esperado ${this.render.serviceId}, obtenido ${service.id}`);
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.type,
      serviceState: service.serviceDetails?.state
    };
  }

  /**
   * Test de health check
   */
  async testHealthCheck() {
    const health = await this.render.healthCheck();
    
    if (!health.status) {
      throw new Error('Status no encontrado en health check');
    }

    const validStatuses = ['healthy', 'unhealthy', 'error'];
    if (!validStatuses.includes(health.status)) {
      throw new Error(`Status inválido: ${health.status}`);
    }

    return {
      status: health.status,
      hasResponse: !!health.response,
      hasError: !!health.error
    };
  }

  /**
   * Test de listado de deployments
   */
  async testListDeployments() {
    const deployments = await this.render.listDeployments(3);
    
    if (!Array.isArray(deployments)) {
      throw new Error('Deployments response no es un array');
    }

    if (deployments.length === 0) {
      throw new Error('No se encontraron deployments');
    }

    const latestDeploy = deployments[0];
    if (!latestDeploy.id) {
      throw new Error('Latest deployment no tiene ID');
    }

    if (!latestDeploy.status) {
      throw new Error('Latest deployment no tiene status');
    }

    return {
      totalDeployments: deployments.length,
      latestId: latestDeploy.id,
      latestStatus: latestDeploy.status,
      latestDate: latestDeploy.createdAt
    };
  }

  /**
   * Test de variables de entorno
   */
  async testEnvironmentVariables() {
    const envVars = await this.render.listEnvironmentVariables();
    
    if (!Array.isArray(envVars)) {
      throw new Error('Environment variables response no es un array');
    }

    // Verificar que existan variables críticas
    const criticalVars = ['NODE_ENV', 'PORT'];
    const existingVars = envVars.map(v => v.key);
    
    const missingCritical = criticalVars.filter(critical => 
      !existingVars.includes(critical)
    );

    if (missingCritical.length > 0) {
      console.log(chalk.yellow(`   ⚠️ Variables críticas faltantes: ${missingCritical.join(', ')}`));
    }

    return {
      totalVariables: envVars.length,
      hasNodeEnv: existingVars.includes('NODE_ENV'),
      hasPort: existingVars.includes('PORT'),
      missingCritical
    };
  }

  /**
   * Test de métricas
   */
  async testMetrics() {
    const metrics = await this.render.getMetrics();
    
    if (!metrics.service) {
      throw new Error('Service info no encontrada en métricas');
    }

    if (!metrics.health) {
      throw new Error('Health info no encontrada en métricas');
    }

    return {
      hasService: !!metrics.service,
      hasHealth: !!metrics.health,
      hasLatestDeployment: !!metrics.latestDeployment,
      serviceState: metrics.service.serviceDetails?.state,
      healthStatus: metrics.health.status
    };
  }

  /**
   * Muestra resumen de todos los tests
   */
  showTestSummary() {
    console.log('');
    console.log(chalk.yellow.bold('📊 RESUMEN DE TESTS'));
    console.log(chalk.gray('═'.repeat(40)));

    const passed = this.testResults.filter(t => t.status === 'passed');
    const failed = this.testResults.filter(t => t.status === 'failed');

    console.log(chalk.white(`   Total: ${this.testResults.length} tests`));
    console.log(chalk.green(`   Pasaron: ${passed.length}`));
    console.log(chalk.red(`   Fallaron: ${failed.length}`));

    if (passed.length > 0) {
      const avgDuration = passed.reduce((sum, t) => sum + t.duration, 0) / passed.length;
      console.log(chalk.blue(`   Tiempo promedio: ${Math.round(avgDuration)}ms`));
    }

    if (failed.length > 0) {
      console.log(chalk.red('\n❌ TESTS FALLIDOS:'));
      failed.forEach(test => {
        console.log(chalk.red(`   • ${test.name}: ${test.error}`));
      });
    }

    const successRate = (passed.length / this.testResults.length) * 100;
    const rateColor = successRate === 100 ? chalk.green : successRate >= 80 ? chalk.yellow : chalk.red;
    
    console.log(rateColor(`\n📈 Tasa de éxito: ${successRate.toFixed(1)}%`));

    if (successRate === 100) {
      console.log(chalk.green.bold('\n🎉 ¡TODOS LOS TESTS PASARON!'));
      console.log(chalk.green('✅ El MCP Render está funcionando correctamente'));
    } else if (successRate >= 80) {
      console.log(chalk.yellow.bold('\n⚠️ LA MAYORÍA DE TESTS PASARON'));
      console.log(chalk.yellow('🔧 Revisa los tests fallidos para problemas menores'));
    } else {
      console.log(chalk.red.bold('\n🚨 VARIOS TESTS FALLARON'));
      console.log(chalk.red('❌ Revisa la configuración y conectividad'));
    }
  }

  /**
   * Test específico de deployment (cuidado - crea deployment real)
   */
  async testDeployment() {
    console.log(chalk.yellow('⚠️ Este test crea un deployment real en Render'));
    console.log(chalk.yellow('⚠️ ¿Estás seguro de que quieres continuar? (y/N)'));

    // En un entorno real, aquí usarías readline para input del usuario
    // Por ahora, lo dejamos como placeholder
    
    console.log(chalk.gray('Test de deployment omitido para seguridad'));
    return { skipped: true, reason: 'Requiere confirmación manual' };
  }

  /**
   * Test de performance
   */
  async testPerformance() {
    console.log(chalk.blue('🏃‍♂️ Ejecutando tests de performance...'));

    const performanceTests = [
      { name: 'Service Info', test: () => this.render.getServiceInfo() },
      { name: 'Health Check', test: () => this.render.healthCheck() },
      { name: 'List Deployments', test: () => this.render.listDeployments(5) }
    ];

    const results = [];

    for (const test of performanceTests) {
      const iterations = 3;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await test.test();
        times.push(Date.now() - start);
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      results.push({
        name: test.name,
        avgTime: Math.round(avgTime),
        minTime,
        maxTime,
        iterations
      });
    }

    console.log(chalk.yellow('\n⚡ RESULTADOS DE PERFORMANCE:'));
    results.forEach(result => {
      console.log(chalk.white(`   ${result.name}:`));
      console.log(chalk.gray(`      Promedio: ${result.avgTime}ms`));
      console.log(chalk.gray(`      Rango: ${result.minTime}ms - ${result.maxTime}ms`));
    });

    return results;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RenderMCPTester();
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'all':
      case undefined:
        await tester.runAllTests();
        break;
        
      case 'performance':
      case 'perf':
        await tester.testPerformance();
        break;
        
      case 'deploy':
        await tester.testDeployment();
        break;
        
      case 'connection':
        await tester.runSingleTest('Conexión API', () => tester.testAPIConnection());
        break;
        
      case 'service':
        await tester.runSingleTest('Info del Servicio', () => tester.testServiceInfo());
        break;
        
      case 'health':
        await tester.runSingleTest('Health Check', () => tester.testHealthCheck());
        break;
        
      default:
        console.log(chalk.blue('🧪 Test Suite - MCP Render'));
        console.log(chalk.white('\n📋 Comandos disponibles:'));
        console.log(chalk.gray('   all          - Ejecutar todos los tests (default)'));
        console.log(chalk.gray('   performance  - Tests de performance'));
        console.log(chalk.gray('   connection   - Test de conexión API'));
        console.log(chalk.gray('   service      - Test de info del servicio'));
        console.log(chalk.gray('   health       - Test de health check'));
        console.log(chalk.gray('   deploy       - Test de deployment (¡CUIDADO!)'));
        break;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error ejecutando tests:'), error.message);
    process.exit(1);
  }
}

export default RenderMCPTester;