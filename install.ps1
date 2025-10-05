# ZombieCoder Bengali Extension - Windows PowerShell Installation Script
# This script installs all dependencies and sets up the complete ecosystem

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

# Configuration
$InstallDir = "$env:USERPROFILE\.zombiecoder"
$LogFile = "$InstallDir\install.log"

# Create installation directory
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Start-Transcript -Path $LogFile -Append

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     ZombieCoder Bengali Extension - Installation          ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to install Chocolatey
function Install-Chocolatey {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    if (Test-CommandExists choco) {
        Write-Host "Chocolatey already installed" -ForegroundColor Green
    } else {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host "Chocolatey installed successfully" -ForegroundColor Green
    }
}

# Function to install Node.js
function Install-NodeJS {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    if (Test-CommandExists node) {
        Write-Host "Node.js already installed: $(node --version)" -ForegroundColor Green
    } else {
        choco install nodejs -y
        Write-Host "Node.js installed successfully" -ForegroundColor Green
    }
}

# Function to install Python
function Install-Python {
    Write-Host "Installing Python..." -ForegroundColor Yellow
    if (Test-CommandExists python) {
        Write-Host "Python already installed: $(python --version)" -ForegroundColor Green
    } else {
        choco install python -y
        Write-Host "Python installed successfully" -ForegroundColor Green
    }
}

# Function to install Ollama
function Install-Ollama {
    Write-Host "Installing Ollama..." -ForegroundColor Yellow
    if (Test-CommandExists ollama) {
        Write-Host "Ollama already installed" -ForegroundColor Green
    } else {
        $OllamaInstaller = "$env:TEMP\OllamaSetup.exe"
        Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $OllamaInstaller
        Start-Process -FilePath $OllamaInstaller -ArgumentList "/S" -Wait
        Remove-Item $OllamaInstaller
        Write-Host "Ollama installed successfully" -ForegroundColor Green
    }
}

# Function to install MySQL
function Install-MySQL {
    Write-Host "Installing MySQL..." -ForegroundColor Yellow
    if (Test-CommandExists mysql) {
        Write-Host "MySQL already installed" -ForegroundColor Green
    } else {
        choco install mysql -y
        Write-Host "MySQL installed successfully" -ForegroundColor Green
    }
}

# Function to install SQLite
function Install-SQLite {
    Write-Host "Installing SQLite..." -ForegroundColor Yellow
    if (Test-CommandExists sqlite3) {
        Write-Host "SQLite already installed" -ForegroundColor Green
    } else {
        choco install sqlite -y
        Write-Host "SQLite installed successfully" -ForegroundColor Green
    }
}

# Function to install VS Code
function Install-VSCode {
    Write-Host "Installing VS Code..." -ForegroundColor Yellow
    if (Test-CommandExists code) {
        Write-Host "VS Code already installed" -ForegroundColor Green
    } else {
        choco install vscode -y
        Write-Host "VS Code installed successfully" -ForegroundColor Green
    }
}

# Function to setup project
function Setup-Project {
    Write-Host "Setting up ZombieCoder project..." -ForegroundColor Yellow
    
    # Install npm dependencies
    npm install
    
    # Build the project
    npm run compile
    
    # Initialize database
    npm run db:init
    
    Write-Host "Project setup completed" -ForegroundColor Green
}

# Function to build extension
function Build-Extension {
    Write-Host "Building VS Code extension..." -ForegroundColor Yellow
    npm run vsix
    Write-Host "Extension built: zombiecoder-bengali-extension-1.0.0.vsix" -ForegroundColor Green
}

# Function to start services
function Start-Services {
    Write-Host "Starting ZombieCoder services..." -ForegroundColor Yellow
    
    # Start Ollama
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Write-Host "Ollama started" -ForegroundColor Green
    
    # Start Gateway and Agents
    Start-Process -FilePath "npm" -ArgumentList "run", "start:all" -WindowStyle Hidden
    Write-Host "Gateway and Agents started" -ForegroundColor Green
    
    # Start Admin Panel
    Start-Process -FilePath "npm" -ArgumentList "run", "start:admin" -WindowStyle Hidden
    Write-Host "Admin Panel started" -ForegroundColor Green
}

# Main installation menu
function Show-Menu {
    Write-Host ""
    Write-Host "Select installation type:" -ForegroundColor Blue
    Write-Host "1) Admin Panel Only"
    Write-Host "2) VS Code Extension Only"
    Write-Host "3) Complete Installation (Admin + Extension + All Services)"
    Write-Host "4) Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice [1-4]"
    
    switch ($choice) {
        "1" {
            Write-Host "Installing Admin Panel..." -ForegroundColor Green
            Install-Chocolatey
            Install-NodeJS
            Install-Python
            Install-MySQL
            Install-SQLite
            Setup-Project
            Start-Services
            Write-Host "Admin Panel installed! Access at: http://localhost:3000" -ForegroundColor Green
        }
        "2" {
            Write-Host "Installing VS Code Extension..." -ForegroundColor Green
            Install-Chocolatey
            Install-NodeJS
            Install-VSCode
            Setup-Project
            Build-Extension
            Write-Host "Extension built! Install with: code --install-extension zombiecoder-bengali-extension-1.0.0.vsix" -ForegroundColor Green
        }
        "3" {
            Write-Host "Complete Installation..." -ForegroundColor Green
            Install-Chocolatey
            Install-NodeJS
            Install-Python
            Install-Ollama
            Install-MySQL
            Install-SQLite
            Install-VSCode
            Setup-Project
            Build-Extension
            Start-Services
            
            Write-Host ""
            Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║          Installation Completed Successfully!             ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Write-Host "Access Points:" -ForegroundColor Blue
            Write-Host "  Admin Panel: http://localhost:3000" -ForegroundColor Green
            Write-Host "  Gateway API: http://localhost:8001" -ForegroundColor Green
            Write-Host "  VS Code Extension: code --install-extension zombiecoder-bengali-extension-1.0.0.vsix" -ForegroundColor Green
            Write-Host ""
            Write-Host "Logs Location:" -ForegroundColor Blue
            Write-Host "  Installation: $LogFile" -ForegroundColor Green
        }
        "4" {
            Write-Host "Installation cancelled" -ForegroundColor Yellow
            Stop-Transcript
            exit 0
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Show-Menu
        }
    }
}

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run this script as Administrator" -ForegroundColor Red
    Stop-Transcript
    exit 1
}

# Start installation
Show-Menu

Write-Host ""
Write-Host "Installation script completed!" -ForegroundColor Green
Write-Host "For documentation, visit: https://github.com/yourusername/zombiecoder-bengali-extension" -ForegroundColor Blue

Stop-Transcript
