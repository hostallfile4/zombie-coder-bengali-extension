# ZombieCoder Bengali Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/zombie-coder/bengali-extension)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.80.0+-blue.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> Authentic AI-powered coding assistant with Bengali language support, real-time WebSocket communication, and production-ready database integration

## 🚀 Features

### 🤖 Dual Mode Operation
- **Local Mode**: Use Ollama models for offline coding assistance
- **Server Mode**: Connect to ZombieCoder server for advanced AI agents

### 🎯 Specialized AI Agents
- **General Assistant**: All-purpose coding help
- **Code Reviewer**: Code analysis and optimization
- **Bug Fixer**: Identify and fix issues
- **Documentation**: Generate docs and comments
- **Translator**: Multi-language code translation

### 🗣️ Bengali Language Support
- Bengali voice commands (experimental)
- Multi-language responses (English/Bengali/Auto-detect)
- Native Bengali interface elements

### 💡 Copilot-Style Interface
- Sidebar chat interface with GitHub Copilot aesthetics
- Real-time streaming responses via SSE
- Live typing indicators with animated dots
- Message history and context management
- VS Code theme integration with dark mode support
- File upload and context injection
- Quick suggestion chips

### ⚡ Real-Time Streaming
- Server-Sent Events (SSE) for instant responses
- Character-by-character streaming display
- Low latency (< 100ms) streaming
- Smooth cursor animations during typing

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "ZombieCoder Bengali Extension"
4. Click Install

### From VSIX File
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

## 🛠️ Setup

### Local Mode (Recommended for Beginners)
1. Install [Ollama](https://ollama.ai/)
   \`\`\`bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull coding models
   ollama pull codellama
   ollama pull llama2
   ollama pull mistral
   \`\`\`
2. Open ZombieCoder settings and configure:
   - Mode: Local
   - Ollama URL: `http://localhost:11434`
   - Model: `codellama`

### Server Mode (Advanced)
1. Start the Gateway Server:
   \`\`\`bash
   npm run gateway
   \`\`\`
2. Start AI Agents:
   \`\`\`bash
   # Start all agents
   npm run dev:all
   
   # Or start individually
   npm run agent:codegen
   npm run agent:bengali
   npm run agent:review
   \`\`\`
3. Configure in VS Code settings:
   - Mode: Server
   - Server URL: `http://127.0.0.1:8001`
   - API Key: `zombiecoder-gateway-token`

## 🎮 Usage

### Opening the Assistant
- Click the ZombieCoder icon in the sidebar
- Use Command Palette: `ZombieCoder: Open Assistant`
- Keyboard shortcut: `Ctrl+Alt+Z`

### Switching Modes
- Click the mode indicator in status bar
- Use Command Palette: `ZombieCoder: Toggle Mode`
- Change in settings panel

### Using the Chat Interface
1. Type your question in the input box
2. Select mode (Chat/Code/Review) from dropdown
3. Choose your preferred agent/model
4. Press Enter or click Send
5. Watch the AI response stream in real-time

### Adding Context
- Click "Context" button to add selected code
- Click "File" button to upload files
- Use suggestion chips for quick prompts

### Voice Commands (Experimental)
Enable in settings and use Bengali voice commands:
- "কোড লিখো" (Write code)
- "বাগ খুঁজো" (Find bugs)
- "ডকুমেন্ট করো" (Document this)

## ⚙️ Configuration

Access settings via:
- Command Palette: `ZombieCoder: Open Settings`
- VS Code Settings: Search "zombiecoder"
- Settings gear icon in sidebar

### Key Settings
- **Mode**: Local or Server operation
- **Ollama URL**: Local Ollama server endpoint (default: `http://localhost:11434`)
- **Server URL**: ZombieCoder gateway server endpoint (default: `http://127.0.0.1:8001`)
- **API Key**: Authentication token for server mode
- **Response Language**: English, Bengali, or Auto-detect
- **Max Tokens**: Response length limit (256-8192)
- **Temperature**: AI creativity level (0.0-2.0)

## 🏗️ Architecture

\`\`\`
VS Code Extension  ←→  Gateway Server (8001)  ←→  AI Agents (8002-8014)
        │                     │                           │
        │                     │                           ├─ Bengali NLP (8002)
        │                     │                           ├─ Code Generation (8003)
        │                     │                           ├─ Code Review (8004)
        │                     │                           ├─ Documentation (8005)
        │                     │                           ├─ Testing (8006)
        │                     │                           ├─ Deployment (8007)
        │                     │                           └─ Voice Processor (8014)
        │
        ▼
   Web Dashboard (3000)  ←→  Admin Panel & Monitoring
        │
   Local Models (Ollama @11434)
\`\`\`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system architecture.

## 🔧 Development

### Prerequisites
- Node.js 16+
- VS Code 1.74.0+
- TypeScript 4.9+
- Ollama (for local mode)

### Building from Source
\`\`\`bash
# Clone repository
git clone https://github.com/zombiecoder/bengali-extension.git
cd bengali-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package

# Build VSIX
npm run vsix
\`\`\`

### Running in Development
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VS Code window

### Running Backend Services
\`\`\`bash
# Start gateway server
npm run gateway

# Start code generator agent
npm run agent:codegen

# Start all services
npm run dev:all
\`\`\`

### Testing the API
\`\`\`bash
# Health check
curl http://localhost:8001/health

# List models
curl http://localhost:8001/v1/models

# Test streaming chat
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer zombiecoder-gateway-token" \
  -d '{
    "model": "codellama",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
\`\`\`

## 📊 Performance Targets

- Chat response: < 2s
- Code completion: < 500ms
- Streaming latency: < 100ms
- Extension activation: < 1s

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/zombiecoder/bengali-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zombiecoder/bengali-extension/discussions)
- **Email**: support@zombiecoder.dev

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local AI model support
- [VS Code Extension API](https://code.visualstudio.com/api) for the platform
- Bengali language community for feedback and support
- GitHub Copilot for UI/UX inspiration

---

**Made with ❤️ for the Bengali developer community**
