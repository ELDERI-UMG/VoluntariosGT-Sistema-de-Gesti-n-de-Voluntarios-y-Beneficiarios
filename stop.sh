#!/bin/bash

# VoluntariosGT - Script para Detener Servicios
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
echo -e "${RED}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                        VoluntariosGT                         ║"
echo "║                   Deteniendo Servicios...                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para detener servicio por PID
stop_service() {
    local name=$1
    local pid_file="logs/${name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        
        if kill -0 $pid 2>/dev/null; then
            print_message "Deteniendo $name (PID: $pid)..."
            
            # Intentar detener gracefully
            kill -TERM $pid 2>/dev/null || true
            
            # Esperar hasta 10 segundos
            for i in {1..10}; do
                if ! kill -0 $pid 2>/dev/null; then
                    print_info "✓ $name detenido correctamente"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
            done
            
            # Si no se detuvo, forzar
            print_warning "Forzando detención de $name..."
            kill -KILL $pid 2>/dev/null || true
            rm -f "$pid_file"
            print_info "✓ $name detenido forzadamente"
        else
            print_warning "$name no estaba ejecutándose (PID inválido)"
            rm -f "$pid_file"
        fi
    else
        print_info "$name no tiene archivo PID (posiblemente no estaba ejecutándose)"
    fi
}

# Función para matar procesos por puerto
kill_port() {
    local port=$1
    local name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ ! -z "$pids" ]; then
        print_message "Deteniendo procesos en puerto $port ($name)..."
        echo "PIDs encontrados: $pids"
        
        # Intentar detener gracefully
        for pid in $pids; do
            kill -TERM $pid 2>/dev/null || true
        done
        
        sleep 3
        
        # Verificar si aún están corriendo
        local remaining_pids=$(lsof -ti:$port 2>/dev/null || true)
        
        if [ ! -z "$remaining_pids" ]; then
            print_warning "Forzando detención de procesos en puerto $port..."
            for pid in $remaining_pids; do
                kill -KILL $pid 2>/dev/null || true
            done
        fi
        
        print_info "✓ Puerto $port liberado"
    else
        print_info "Puerto $port ya está libre"
    fi
}

# Crear directorio de logs si no existe
mkdir -p logs

print_message "Deteniendo servicios de VoluntariosGT..."

# Detener servicios por PID files
stop_service "backend"
stop_service "dashboard"
stop_service "expo"

# Detener por puertos como respaldo
print_message "Verificando puertos..."
kill_port 5000 "Backend"
kill_port 5173 "Dashboard"
kill_port 8081 "Expo"

# Detener otros procesos relacionados con Expo/Metro
print_message "Deteniendo procesos de Expo/Metro..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "@expo/cli" 2>/dev/null || true

# Limpiar archivos temporales
print_message "Limpiando archivos temporales..."

# Limpiar cache de Expo
if [ -d "frontend/.expo" ]; then
    rm -rf frontend/.expo
    print_info "✓ Cache de Expo limpiado"
fi

# Limpiar node_modules/.cache si existe
find . -name ".cache" -type d -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true

print_info "✓ Archivos temporales limpiados"

# Verificar que todos los servicios estén detenidos
print_message "Verificando que los servicios estén detenidos..."

SERVICES_RUNNING=false

# Verificar puertos
for port in 5000 5173 8081; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto $port aún está en uso"
        SERVICES_RUNNING=true
    fi
done

# Verificar procesos de Expo
if pgrep -f "expo start" >/dev/null 2>&1; then
    print_warning "Procesos de Expo aún están ejecutándose"
    SERVICES_RUNNING=true
fi

if [ "$SERVICES_RUNNING" = true ]; then
    print_warning "Algunos servicios pueden seguir ejecutándose"
    print_info "Puedes usar 'ps aux | grep -E \"(node|expo)\"' para verificar procesos manualmente"
else
    print_info "✓ Todos los servicios han sido detenidos correctamente"
fi

# Mostrar resumen
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ¡SERVICIOS DETENIDOS!                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_info "RESUMEN:"
echo ""
echo "✓ Backend API (puerto 5000) - Detenido"
echo "✓ Dashboard Web (puerto 5173) - Detenido"
echo "✓ Frontend Móvil/Expo (puerto 8081) - Detenido"
echo "✓ Archivos temporales - Limpiados"
echo ""

print_info "COMANDOS ÚTILES:"
echo ""
echo "• Reiniciar servicios:"
echo "  ./start.sh"
echo ""
echo "• Ver logs anteriores:"
echo "  cat logs/backend.log"
echo "  cat logs/dashboard.log"
echo "  cat logs/expo.log"
echo ""
echo "• Limpiar logs:"
echo "  rm -f logs/*.log"
echo ""
echo "• Verificar procesos manualmente:"
echo "  ps aux | grep -E \"(node|expo)\""
echo "  lsof -i :5000,5173,8081"
echo ""

print_message "¡Servicios de VoluntariosGT detenidos correctamente! 🇬🇹"
print_info "Para reiniciar: ./start.sh | Soporte: elder@voluntariosgt.org"

