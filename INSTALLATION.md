# Installation Guide

Complete step-by-step installation guide for ZombieCoder Bengali Extension.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [VS Code Extension](#vs-code-extension)
5. [Database Setup](#database-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disk**: 10 GB free space
- **Node.js**: 16.x or higher
- **VS Code**: 1.74.0 or higher

### Recommended Requirements

- **CPU**: 8+ cores
- **RAM**: 16 GB
- **Disk**: 20 GB SSD
- **GPU**: NVIDIA GPU with 8GB+ VRAM (for local AI models)

## Quick Start

### One-Line Installation

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/zombiecoder/bengali-extension/main/scripts/install.sh | bash
\`\`\`

This script will:
1. Install all dependencies
2. Setup the database
3. Configure environment variables
4. Start all services
5. Install the VS Code extension

## Detailed Installation

### Step 1: Install Node.js

#### Windows

Download and install from [nodejs.org](https://nodejs.org/)

#### macOS

\`\`\`bash
# Using Homebrew
brew install node@18
\`\`\`

#### Linux

\`\`\`bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

### Step 2: Install MySQL

#### Windows

Download and install from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)

#### macOS

\`\`\`bash
brew install mysql@8.0
brew services start mysql@8.0
\`\`\`

#### Linux

\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
\`\`\`

### Step 3: Install Ollama

Ollama provides local AI models.

#### All Platforms

\`\`\`bash
curl -fsSL https://ollama.ai/install.sh | sh
\`\`\`

#### Verify Installation

\`\`\`bash
ollama --version
\`\`\`

#### Pull Required Models

\`\`\`bash
# Code generation model
ollama pull codellama

# General purpose model
ollama pull llama2

# Fast model for quick responses
ollama pull mistral
\`\`\`

### Step 4: Clone Repository

\`\`\`bash
git clone https://github.com/zombiecoder/bengali-extension.git
cd bengali-extension
\`\`\`

### Step 5: Install Dependencies

\`\`\`bash
# Install root dependencies
npm install

# Install extension dependencies
cd extension
npm install
cd ..

# Install admin panel dependencies
cd admin-panel
npm install
cd ..
\`\`\`

### Step 6: Configure Environment

\`\`\`bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
\`\`\`

Update the following values:

\`\`\`env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=zombiecoder
DB_USERNAME=root
DB_PASSWORD=your_password_here

# API Configuration
API_KEY=your-secure-api-key-here

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
\`\`\`

### Step 7: Setup Database

\`\`\`bash
# Create database
mysql -u root -p -e "CREATE DATABASE zombiecoder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run initialization script
npm run db:init

# Seed with sample data (optional)
npm run db:seed
\`\`\`

### Step 8: Build Project

\`\`\`bash
# Build all components
npm run build

# Or build individually
npm run build:gateway
npm run build:agents
npm run build:admin
npm run build:extension
\`\`\`

### Step 9: Start Services

\`\`\`bash
# Start all services
npm run dev:all

# Or start individually
npm run gateway        # Gateway server (port 8001)
npm run admin          # Admin panel (port 3000)
npm run agent:bengali  # Bengali NLP agent (port 8002)
npm run agent:codegen  # Code generation agent (port 8003)
\`\`\`

## VS Code Extension

### Method 1: Install from VSIX

\`\`\`bash
# Build VSIX package
cd extension
npm run package

# Install in VS Code
code --install-extension zombiecoder-bengali-1.0.0.vsix
\`\`\`

### Method 2: Install from Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "ZombieCoder Bengali"
4. Click Install

### Method 3: Development Mode

1. Open the `extension` folder in VS Code
2. Press F5 to launch Extension Development Host
3. Test the extension in the new window

### Configure Extension

1. Open VS Code Settings (Ctrl+,)
2. Search for "zombiecoder"
3. Configure:
   - Gateway URL: `http://localhost:8001`
   - API Key: (your API key from .env)
   - Enable Bengali: ✓
   - Enable Streaming: ✓

## Database Setup

### Manual Database Creation

\`\`\`sql
-- Create database
CREATE DATABASE zombiecoder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'zombiecoder_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder_user'@'localhost';
FLUSH PRIVILEGES;

-- Use database
USE zombiecoder;

-- Run initialization script
SOURCE scripts/init-database.sql;
\`\`\`

### Verify Database

\`\`\`bash
# Check tables
mysql -u root -p zombiecoder -e "SHOW TABLES;"

# Check data
mysql -u root -p zombiecoder -e "SELECT COUNT(*) FROM chat_history;"
\`\`\`

## Verification

### Check Services

\`\`\`bash
# Gateway server
curl http://localhost:8001/health

# Admin panel
curl http://localhost:3000

# Ollama
curl http://localhost:11434/api/tags

# MySQL
mysql -u root -p -e "SELECT 1"
\`\`\`

### Test API

\`\`\`bash
# Test chat endpoint
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "codellama",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
\`\`\`

### Test Extension

1. Open VS Code
2. Click ZombieCoder icon in sidebar
3. Type a message in chat
4. Verify response appears

## Troubleshooting

### Port Already in Use

\`\`\`bash
# Find process using port
lsof -i :8001

# Kill process
kill -9 <PID>
\`\`\`

### Database Connection Failed

\`\`\`bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -h 127.0.0.1 -P 3307 -u root -p

# Check firewall
sudo ufw status
\`\`\`

### Ollama Not Found

\`\`\`bash
# Check Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Check models
ollama list
\`\`\`

### Extension Not Loading

1. Check VS Code version: Help → About
2. Reload window: Ctrl+Shift+P → "Reload Window"
3. Check extension logs: View → Output → ZombieCoder
4. Reinstall extension

### Build Errors

\`\`\`bash
# Clean build
npm run clean

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
\`\`\`

### Permission Errors

\`\`\`bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Fix MySQL socket
sudo chmod 777 /var/run/mysqld/mysqld.sock
\`\`\`

## Post-Installation

### Configure Firewall

\`\`\`bash
# Allow required ports
sudo ufw allow 8001/tcp  # Gateway
sudo ufw allow 3000/tcp  # Admin
sudo ufw allow 3307/tcp  # MySQL
sudo ufw enable
\`\`\`

### Setup Systemd Services

Create `/etc/systemd/system/zombiecoder.service`:

\`\`\`ini
[Unit]
Description=ZombieCoder Gateway
After=network.target mysql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/zombiecoder
ExecStart=/usr/bin/npm run gateway
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

Enable service:

\`\`\`bash
sudo systemctl enable zombiecoder
sudo systemctl start zombiecoder
sudo systemctl status zombiecoder
\`\`\`

### Setup Logging

\`\`\`bash
# Create log directory
sudo mkdir -p /var/log/zombiecoder
sudo chown $USER:$USER /var/log/zombiecoder

# Configure log rotation
sudo nano /etc/logrotate.d/zombiecoder
\`\`\`

Add:

\`\`\`
/var/log/zombiecoder/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 your-user your-user
}
\`\`\`

## Next Steps

1. Read the [User Guide](docs/USER_GUIDE.md)
2. Explore the [API Documentation](docs/API.md)
3. Check out [Examples](examples/)
4. Join our [Community](https://github.com/zombiecoder/bengali-extension/discussions)

## Getting Help

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/zombiecoder/bengali-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zombiecoder/bengali-extension/discussions)
- **Email**: support@zombiecoder.dev
