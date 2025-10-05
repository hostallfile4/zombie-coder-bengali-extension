#!/bin/bash

# ZombieCoder Bengali Extension - Ubuntu/Linux Installation Script
# This script installs all dependencies and sets up the complete ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="$HOME/.zombiecoder"
LOG_FILE="$INSTALL_DIR/install.log"

# Create installation directory
mkdir -p "$INSTALL_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ZombieCoder Bengali Extension - Installation          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    echo -e "${YELLOW}Installing Node.js...${NC}"
    if command_exists node; then
        echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        echo -e "${GREEN}Node.js installed successfully${NC}"
    fi
}

# Function to install Python
install_python() {
    echo -e "${YELLOW}Installing Python...${NC}"
    if command_exists python3; then
        echo -e "${GREEN}Python already installed: $(python3 --version)${NC}"
    else
        sudo apt-get install -y python3 python3-pip python3-venv
        echo -e "${GREEN}Python installed successfully${NC}"
    fi
}

# Function to install Ollama
install_ollama() {
    echo -e "${YELLOW}Installing Ollama...${NC}"
    if command_exists ollama; then
        echo -e "${GREEN}Ollama already installed${NC}"
    else
        curl -fsSL https://ollama.com/install.sh | sh
        echo -e "${GREEN}Ollama installed successfully${NC}"
    fi
}

# Function to install MySQL
install_mysql() {
    echo -e "${YELLOW}Installing MySQL...${NC}"
    if command_exists mysql; then
        echo -e "${GREEN}MySQL already installed${NC}"
    else
        sudo apt-get install -y mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
        echo -e "${GREEN}MySQL installed successfully${NC}"
    fi
}

# Function to install SQLite
install_sqlite() {
    echo -e "${YELLOW}Installing SQLite...${NC}"
    if command_exists sqlite3; then
        echo -e "${GREEN}SQLite already installed${NC}"
    else
        sudo apt-get install -y sqlite3 libsqlite3-dev
        echo -e "${GREEN}SQLite installed successfully${NC}"
    fi
}

# Function to install VS Code
install_vscode() {
    echo -e "${YELLOW}Installing VS Code...${NC}"
    if command_exists code; then
        echo -e "${GREEN}VS Code already installed${NC}"
    else
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
        sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
        rm -f packages.microsoft.gpg
        sudo apt-get update
        sudo apt-get install -y code
        echo -e "${GREEN}VS Code installed successfully${NC}"
    fi
}

# Function to setup project
setup_project() {
    echo -e "${YELLOW}Setting up ZombieCoder project...${NC}"
    
    # Install npm dependencies
    npm install
    
    # Build the project
    npm run compile
    
    # Initialize database
    npm run db:init
    
    echo -e "${GREEN}Project setup completed${NC}"
}

# Function to build extension
build_extension() {
    echo -e "${YELLOW}Building VS Code extension...${NC}"
    npm run vsix
    echo -e "${GREEN}Extension built: zombiecoder-bengali-extension-1.0.0.vsix${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting ZombieCoder services...${NC}"
    
    # Start Ollama
    if ! pgrep -x "ollama" > /dev/null; then
        ollama serve > "$INSTALL_DIR/ollama.log" 2>&1 &
        echo -e "${GREEN}Ollama started${NC}"
    fi
    
    # Start Gateway and Agents
    npm run start:all > "$INSTALL_DIR/services.log" 2>&1 &
    echo -e "${GREEN}Gateway and Agents started${NC}"
    
    # Start Admin Panel
    npm run start:admin > "$INSTALL_DIR/admin.log" 2>&1 &
    echo -e "${GREEN}Admin Panel started${NC}"
}

# Main installation menu
show_menu() {
    echo ""
    echo -e "${BLUE}Select installation type:${NC}"
    echo "1) Admin Panel Only"
    echo "2) VS Code Extension Only"
    echo "3) Complete Installation (Admin + Extension + All Services)"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1)
            echo -e "${GREEN}Installing Admin Panel...${NC}"
            install_nodejs
            install_python
            install_mysql
            install_sqlite
            setup_project
            start_services
            echo -e "${GREEN}Admin Panel installed! Access at: http://localhost:3000${NC}"
            ;;
        2)
            echo -e "${GREEN}Installing VS Code Extension...${NC}"
            install_nodejs
            install_vscode
            setup_project
            build_extension
            echo -e "${GREEN}Extension built! Install with: code --install-extension zombiecoder-bengali-extension-1.0.0.vsix${NC}"
            ;;
        3)
            echo -e "${GREEN}Complete Installation...${NC}"
            sudo apt-get update
            install_nodejs
            install_python
            install_ollama
            install_mysql
            install_sqlite
            install_vscode
            setup_project
            build_extension
            start_services
            echo ""
            echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║          Installation Completed Successfully!             ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${BLUE}Access Points:${NC}"
            echo -e "  Admin Panel: ${GREEN}http://localhost:3000${NC}"
            echo -e "  Gateway API: ${GREEN}http://localhost:8001${NC}"
            echo -e "  VS Code Extension: ${GREEN}code --install-extension zombiecoder-bengali-extension-1.0.0.vsix${NC}"
            echo ""
            echo -e "${BLUE}Logs Location:${NC}"
            echo -e "  Installation: ${GREEN}$LOG_FILE${NC}"
            echo -e "  Services: ${GREEN}$INSTALL_DIR/services.log${NC}"
            echo -e "  Admin: ${GREEN}$INSTALL_DIR/admin.log${NC}"
            ;;
        4)
            echo -e "${YELLOW}Installation cancelled${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root${NC}"
    exit 1
fi

# Start installation
show_menu

echo ""
echo -e "${GREEN}Installation script completed!${NC}"
echo -e "${BLUE}For documentation, visit: https://github.com/yourusername/zombiecoder-bengali-extension${NC}"
