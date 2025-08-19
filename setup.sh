#!/bin/bash

# VoluntariosGT - Script de Instalación Automática
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

# Banner de bienvenida
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                        VoluntariosGT                         ║"
echo "║          Sistema de Gestión de Voluntarios y Beneficiarios  ║"
echo "║                                                              ║"
echo "║                 Instalación Automática                      ║"
echo "║              Desarrollado por Elder Ramiro Ixcopal Arroyo   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar prerrequisitos
print_message "Verificando prerrequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Se requiere Node.js 18 o superior. Versión actual: $(node --version)"
    exit 1
fi

print_info "✓ Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_info "✓ npm $(npm --version) encontrado"

# Verificar Git
if ! command -v git &> /dev/null; then
    print_warning "Git no está instalado. Algunas funciones pueden no estar disponibles."
else
    print_info "✓ Git $(git --version | cut -d' ' -f3) encontrado"
fi

# Función para instalar dependencias
install_dependencies() {
    local dir=$1
    local name=$2
    
    print_message "Instalando dependencias de $name..."
    cd "$dir"
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_info "✓ Dependencias de $name instaladas"
    cd ..
}

# Función para configurar variables de entorno
setup_env() {
    local dir=$1
    local name=$2
    
    print_message "Configurando variables de entorno para $name..."
    cd "$dir"
    
    if [ -f ".env.example" ] && [ ! -f ".env" ]; then
        cp .env.example .env
        print_info "✓ Archivo .env creado para $name"
        print_warning "IMPORTANTE: Edita el archivo $dir/.env con tus credenciales"
    elif [ -f ".env" ]; then
        print_info "✓ Archivo .env ya existe para $name"
    fi
    
    cd ..
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto VoluntariosGT"
    exit 1
fi

print_message "Iniciando instalación de VoluntariosGT..."

# Instalar Expo CLI globalmente
print_message "Instalando Expo CLI..."
if ! command -v expo &> /dev/null; then
    npm install -g @expo/cli
    print_info "✓ Expo CLI instalado"
else
    print_info "✓ Expo CLI ya está instalado"
fi

# Instalar EAS CLI globalmente
print_message "Instalando EAS CLI..."
if ! command -v eas &> /dev/null; then
    npm install -g @expo/eas-cli
    print_info "✓ EAS CLI instalado"
else
    print_info "✓ EAS CLI ya está instalado"
fi

# Configurar Backend
print_message "=== CONFIGURANDO BACKEND ==="
setup_env "backend" "Backend"
install_dependencies "backend" "Backend"

# Configurar Frontend Móvil
print_message "=== CONFIGURANDO FRONTEND MÓVIL ==="
install_dependencies "frontend" "Frontend Móvil"

# Configurar Dashboard Web
print_message "=== CONFIGURANDO DASHBOARD WEB ==="
setup_env "dashboard-web" "Dashboard Web"
install_dependencies "dashboard-web" "Dashboard Web"

# Crear directorios necesarios
print_message "Creando directorios necesarios..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp
print_info "✓ Directorios creados"

# Configurar permisos
print_message "Configurando permisos..."
chmod +x setup.sh
chmod +x start.sh
print_info "✓ Permisos configurados"

# Verificar instalación
print_message "Verificando instalación..."

# Verificar backend
cd backend
if npm list express &> /dev/null; then
    print_info "✓ Backend configurado correctamente"
else
    print_error "✗ Error en configuración del backend"
fi
cd ..

# Verificar frontend
cd frontend
if npm list expo &> /dev/null; then
    print_info "✓ Frontend móvil configurado correctamente"
else
    print_error "✗ Error en configuración del frontend móvil"
fi
cd ..

# Verificar dashboard
cd dashboard-web
if npm list react &> /dev/null; then
    print_info "✓ Dashboard web configurado correctamente"
else
    print_error "✗ Error en configuración del dashboard web"
fi
cd ..

# Mensaje final
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ¡INSTALACIÓN COMPLETADA!                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_message "VoluntariosGT ha sido instalado exitosamente."
echo ""
print_info "PRÓXIMOS PASOS:"
echo ""
echo "1. Configurar variables de entorno:"
echo "   - Edita backend/.env con tus credenciales de Supabase"
echo "   - Edita dashboard-web/.env con la URL de tu API"
echo ""
echo "2. Configurar base de datos:"
echo "   - Crea un proyecto en https://supabase.com"
echo "   - Ejecuta las migraciones SQL desde supabase/migrations/"
echo ""
echo "3. Iniciar los servicios:"
echo "   - Ejecuta: ./start.sh"
echo "   - O inicia cada servicio manualmente:"
echo "     • Backend: cd backend && npm start"
echo "     • Dashboard: cd dashboard-web && npm run dev"
echo "     • App Móvil: cd frontend && npx expo start"
echo ""
echo "4. Documentación:"
echo "   - Manual de usuario: docs/manual-usuario.md"
echo "   - Documentación técnica: docs/documentacion-tecnica.md"
echo "   - README principal: README.md"
echo ""
print_warning "IMPORTANTE: Revisa y configura todas las variables de entorno antes de usar en producción."
echo ""
print_message "¡Gracias por usar VoluntariosGT! 🇬🇹"
print_info "Para soporte: elder@voluntariosgt.org"

