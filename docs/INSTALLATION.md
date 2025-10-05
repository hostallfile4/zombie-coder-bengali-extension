# ZombieCoder Bengali Extension - Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Installation Options](#installation-options)
4. [Manual Installation](#manual-installation)
5. [Post-Installation](#post-installation)
6. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+ / Windows 10+ / macOS 11+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: 4 cores (8 cores recommended for local AI models)

### Software Dependencies
- Node.js 18.0.0 or higher
- Python 3.8.0 or higher
- MySQL 8.0.0 or higher (for Admin Panel)
- SQLite 3.0.0 or higher
- VS Code 1.80.0 or higher
- Ollama (for local AI models)

## Quick Start

### Ubuntu/Linux

\`\`\`bash
# Download and run installation script
curl -fsSL https://raw.githubusercontent.com/yourusername/zombiecoder-bengali-extension/main/install.sh -o install.sh
chmod +x install.sh
./install.sh
\`\`\`

### Windows

```powershell
# Download and run installation script (Run as Administrator)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/yourusername/zombiecoder-bengali-extension/main/install.ps1" -OutFile "install.ps1"
Set-ExecutionPolicy Bypass -Scope Process -Force
.\install.ps1
