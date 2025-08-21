# 🚀 MCP Render - VoluntariosGT

**Sistema completo de gestión para servicios Render.com**

Este MCP (Model Context Protocol) te permite gestionar completamente tu deployment de VoluntariosGT en Render desde la línea de comandos.

## 📋 Características Principales

- ✅ **Gestión de Servicios**: Start, stop, restart, suspend, resume
- ✅ **Deployment Automático**: Deploy con monitoreo y verificaciones
- ✅ **Variables de Entorno**: CRUD completo de environment variables
- ✅ **Monitoreo en Tiempo Real**: Health checks y logs monitoring
- ✅ **Dashboard de Estado**: Vista completa del estado del servicio
- ✅ **Alertas Inteligentes**: Detección automática de problemas
- ✅ **Rollback Support**: Información para rollbacks manuales

## 🛠️ Instalación

```bash
cd mcp-render
npm install
```

## ⚙️ Configuración

1. **Configurar credenciales** en `.env`:
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

2. **Variables requeridas**:
```env
RENDER_API_TOKEN=rnd_xxxxxxxxxxxxxxxxxxxxxxxxxx
RENDER_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxx
RENDER_SERVICE_URL=https://tu-servicio.onrender.com
```

## 🚀 Uso Rápido

### Comandos Básicos

```bash
# Ver estado del servicio
npm run status

# Reiniciar servicio
node index.js restart

# Crear nuevo deployment
npm run deploy

# Ver logs en tiempo real
npm run logs

# Ver todas las opciones
node index.js
```

### Comandos Avanzados

```bash
# Monitoreo continuo
node status.js watch

# Deployment con verificaciones completas
node deploy.js deploy

# Análisis de logs
node logs.js analyze

# Gestionar variables de entorno
node index.js env
node index.js set-env NODE_ENV production
node index.js update-env PORT 10000
```

## 📊 Dashboard de Estado

```bash
# Dashboard completo
node status.js

# Monitoreo continuo (actualiza cada 60s)
node status.js watch

# Verificación rápida
node status.js quick
```

**Ejemplo de output:**
```
📊 DASHBOARD VOLUNTARIOS GT - RENDER STATUS
═══════════════════════════════════════════════════════════════════════════════
Actualizado: 20/8/2025 10:30:15

🔧 ESTADO DEL SERVICIO
────────────────────────────────────────
   Nombre: voluntarios-backend
   Estado: 🟢 AVAILABLE
   Salud: 💚 HEALTHY
   Tipo: web
   Plan: free
   Región: oregon
   URL: https://voluntariosgt-sistema-de-gesti-n-de.onrender.com

🚀 DEPLOYMENTS RECIENTES
────────────────────────────────────────
   ▶️ 🟢 LIVE
      ID: dpl-abc123def456
      Fecha: 20/8/2025 10:15:30
      Commit: Configure OneSignal integration
```

## 🔄 Deployment Automatizado

```bash
# Deployment completo con verificaciones
npm run deploy
```

**Proceso automático:**
1. ✅ **Pre-deployment checks**: Estado del servicio, deployments en progreso
2. 🚀 **Create deployment**: Inicia nuevo deployment
3. ⏳ **Monitor progress**: Monitorea estado hasta completar
4. ✅ **Post-deployment checks**: Verifica salud y funcionamiento
5. 📊 **Report results**: Resumen completo del deployment

## 📝 Monitoreo de Logs

```bash
# Monitoreo en tiempo real (30s intervalo)
node logs.js monitor

# Obtener logs históricos
node logs.js get 200

# Análisis de patrones
node logs.js analyze
```

**Características del monitor:**
- 🔍 **Health checking** automático
- ⚠️ **Error detection** con alertas
- 📊 **Performance monitoring** (response times)
- 🚨 **Alert threshold** configurable

## ⚙️ Gestión de Variables de Entorno

```bash
# Listar todas las variables
node index.js env

# Crear nueva variable
node index.js set-env NEW_VAR "valor"

# Actualizar variable existente
node index.js update-env NODE_ENV production

# Eliminar variable
node index.js delete-env OLD_VAR

# Sincronizar desde .env local
node index.js sync-env ../backend/.env
```

## 🔧 API de Servicios

```bash
# Información del servicio
node index.js status

# Listar todos los servicios
node index.js list

# Controles de servicio
node index.js restart   # Reiniciar
node index.js suspend   # Suspender
node index.js resume    # Reanudar

# Deployments
node index.js deploy               # Nuevo deployment
node index.js deployments 10      # Últimos 10 deployments
node index.js rollback             # Info para rollback
```

## 📊 Métricas y Monitoreo

```bash
# Métricas completas
node index.js metrics

# Health check
node index.js health

# Estado con monitoreo continuo
node status.js watch 30000  # Actualizar cada 30s
```

## 🔔 Sistema de Alertas

El MCP incluye un sistema de alertas inteligente:

- **🔴 Error Threshold**: Alerta después de N errores consecutivos
- **⏰ Response Time**: Monitoreo de tiempo de respuesta
- **💚 Health Status**: Verificación continua de salud
- **🚨 Deployment Failures**: Alertas de deployments fallidos

## 📦 Scripts del Package.json

```json
{
  "scripts": {
    "start": "node index.js status",
    "dev": "node --watch index.js status",
    "deploy": "node deploy.js deploy",
    "logs": "node logs.js monitor",
    "status": "node status.js",
    "test": "node test.js"
  }
}
```

## 🔒 Seguridad

- ✅ **API Token** seguro en variables de entorno
- ✅ **Sensitive data masking** en logs y outputs
- ✅ **No hardcoded credentials** en el código
- ✅ **Environment separation** (.env vs .env.example)

## 🐛 Troubleshooting

### Error: API Token inválido
```bash
# Verificar token en .env
echo $RENDER_API_TOKEN

# Regenerar token en Render Dashboard
# Account Settings > API Keys > Create API Key
```

### Error: Service ID no encontrado
```bash
# Verificar Service ID en .env
echo $RENDER_SERVICE_ID

# Obtener de la URL: https://dashboard.render.com/web/srv-XXXXXXXXX
```

### Error: Timeout en requests
```bash
# Aumentar timeout en .env
API_TIMEOUT=60000

# Verificar conectividad
node index.js health
```

## 🔄 Integración con CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install MCP dependencies
        run: cd mcp-render && npm install
      - name: Deploy to Render
        env:
          RENDER_API_TOKEN: ${{ secrets.RENDER_API_TOKEN }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: cd mcp-render && npm run deploy
```

## 📈 Roadmap

- [ ] **WebSocket logs streaming** (cuando Render API lo soporte)
- [ ] **Multi-service management** para proyectos complejos
- [ ] **Slack/Discord integrations** para alertas
- [ ] **Automated rollback** en caso de fallos
- [ ] **Performance analytics** con métricas históricas
- [ ] **Cost monitoring** y alertas de uso

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **GitHub Issues**: Para bugs y feature requests
- **Email**: soporte@voluntarios-gt.com
- **Discord**: [Servidor VoluntariosGT](#)

---

**Desarrollado con ❤️ para VoluntariosGT**

*Gestión de infraestructura simplificada para el impacto social en Guatemala*