#!/bin/bash

# VoluntariosGT - Script de Inicio de Servicios
# Autor: Elder Ramiro Ixcopal Arroyo
# Versión: 1.0.0

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[VoluntariosGT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                        VoluntariosGT                         ║"
echo "║                   Iniciando Servicios...                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto VoluntariosGT"
    exit 1
fi

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port)
    if [ ! -z "$pids" ]; then
        echo "Matando procesos en puerto $port: $pids"
        kill -9 $pids 2>/dev/null || true
        sleep 2
    fi
}

# Verificar variables de entorno
print_message "Verificando configuración..."

if [ ! -f "backend/.env" ]; then
    print_error "Archivo backend/.env no encontrado. Ejecuta ./setup.sh primero."
    exit 1
fi

if [ ! -f "dashboard-web/.env" ]; then
    print_warning "Archivo dashboard-web/.env no encontrado. Creando uno básico..."
    echo "VITE_API_BASE_URL=http://localhost:5000/api" > dashboard-web/.env
fi

print_info "✓ Configuración verificada"

# Verificar puertos
BACKEND_PORT=5000
DASHBOARD_PORT=5173
EXPO_PORT=8081

print_message "Verificando puertos disponibles..."

if check_port $BACKEND_PORT; then
    print_warning "Puerto $BACKEND_PORT está en uso. Liberando..."
    kill_port $BACKEND_PORT
fi

if check_port $DASHBOARD_PORT; then
    print_warning "Puerto $DASHBOARD_PORT está en uso. Liberando..."
    kill_port $DASHBOARD_PORT
fi

if check_port $EXPO_PORT; then
    print_warning "Puerto $EXPO_PORT está en uso. Liberando..."
    kill_port $EXPO_PORT
fi

print_info "✓ Puertos verificados"

# Crear logs directory si no existe
mkdir -p logs

# Función para iniciar servicio en background
start_service() {
    local name=$1
    local dir=$2
    local command=$3
    local port=$4
    local log_file="logs/${name}.log"
    
    print_message "Iniciando $name..."
    
    cd "$dir"
    
    # Iniciar el servicio en background
    nohup $command > "../$log_file" 2>&1 &
    local pid=$!
    
    # Guardar PID
    echo $pid > "../logs/${name}.pid"
    
    cd ..
    
    # Esperar un momento para verificar que el servicio inició
    sleep 3
    
    if kill -0 $pid 2>/dev/null; then
        print_info "✓ $name iniciado (PID: $pid, Puerto: $port)"
        print_info "  Log: $log_file"
    else
        print_error "✗ Error al iniciar $name"
        print_error "  Revisa el log: $log_file"
        return 1
    fi
}

# Iniciar Backend
start_service "Backend" "backend" "npm start" $BACKEND_PORT

# Esperar a que el backend esté listo
print_message "Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        print_info "✓ Backend está respondiendo"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend tardó más de lo esperado en responder"
    fi
    sleep 1
done

# Iniciar Dashboard Web
start_service "Dashboard" "dashboard-web" "npm run dev -- --host" $DASHBOARD_PORT

# Iniciar Frontend Móvil (Expo)
print_message "Iniciando Frontend Móvil (Expo)..."
cd frontend

# Verificar si Expo está instalado
if ! command -v expo &> /dev/null; then
    print_error "Expo CLI no está instalado. Ejecuta: npm install -g @expo/cli"
    exit 1
fi

# Iniciar Expo
nohup expo start --port $EXPO_PORT > "../logs/expo.log" 2>&1 &
EXPO_PID=$!
echo $EXPO_PID > "../logs/expo.pid"

cd ..

sleep 5

if kill -0 $EXPO_PID 2>/dev/null; then
    print_info "✓ Frontend Móvil iniciado (PID: $EXPO_PID, Puerto: $EXPO_PORT)"
    print_info "  Log: logs/expo.log"
else
    print_error "✗ Error al iniciar Frontend Móvil"
    print_error "  Revisa el log: logs/expo.log"
fi

# Mostrar información de servicios
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ¡SERVICIOS INICIADOS!                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_info "SERVICIOS ACTIVOS:"
echo ""
echo "🔧 Backend API:"
echo "   URL: http://localhost:$BACKEND_PORT"
echo "   Health Check: http://localhost:$BACKEND_PORT/health"
echo "   Log: logs/backend.log"
echo ""
echo "🌐 Dashboard Web:"
echo "   URL: http://localhost:$DASHBOARD_PORT"
echo "   Log: logs/dashboard.log"
echo ""
echo "📱 Frontend Móvil (Expo):"
echo "   Puerto: $EXPO_PORT"
echo "   Escanea el código QR con Expo Go"
echo "   Log: logs/expo.log"
echo ""

print_info "CREDENCIALES DE PRUEBA:"
echo ""
echo "Dashboard Administrativo:"
echo "  Admin: admin@voluntariosgt.org / admin123"
echo "  Entidad: entidad@ejemplo.org / entidad123"
echo ""
echo "App Móvil:"
echo "  Voluntario: voluntario@test.com / test123"
echo "  Beneficiario: beneficiario@test.com / test123"
echo ""

print_info "COMANDOS ÚTILES:"
echo ""
echo "• Ver logs en tiempo real:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/dashboard.log"
echo "  tail -f logs/expo.log"
echo ""
echo "• Detener servicios:"
echo "  ./stop.sh"
echo ""
echo "• Reiniciar servicios:"
echo "  ./stop.sh && ./start.sh"
echo ""

print_warning "IMPORTANTE:"
echo "• Asegúrate de haber configurado las variables de entorno"
echo "• Para producción, usa configuraciones específicas de producción"
echo "• Los logs se guardan en el directorio logs/"
echo ""

print_message "¡VoluntariosGT está listo para usar! 🇬🇹"
print_info "Documentación: docs/ | Soporte: elder@voluntariosgt.org"

