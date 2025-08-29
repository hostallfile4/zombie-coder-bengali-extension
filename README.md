# ZombieCoder Bengali Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=zombiecoder.zombiecoder-bengali-extension)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> AI-powered coding assistant with Bengali language support and advanced automation

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
- Sidebar chat interface
- Real-time typing indicators
- Message history and context
- VS Code theme integration

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
2. Pull a coding model: `ollama pull codellama`
3. Open ZombieCoder settings and configure:
   - Mode: Local
   - Ollama URL: `http://localhost:11434`
   - Model: `codellama`

### Server Mode
1. Set up your ZombieCoder server
2. Configure in settings:
   - Mode: Server
   - Server URL: Your server endpoint
   - API Key: If required

## 🎮 Usage

### Opening the Assistant
- Click the ZombieCoder icon in the sidebar
- Use Command Palette: `ZombieCoder: Open Assistant`
- Keyboard shortcut: `Ctrl+Alt+Z`

### Switching Modes
- Click the mode indicator in status bar
- Use Command Palette: `ZombieCoder: Toggle Mode`
- Change in settings panel

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
- **Ollama URL**: Local Ollama server endpoint
- **Server URL**: ZombieCoder server endpoint
- **Response Language**: English, Bengali, or Auto-detect
- **Max Tokens**: Response length limit
- **Temperature**: AI creativity level

## 🔧 Development

### Prerequisites
- Node.js 16+
- VS Code 1.74.0+
- TypeScript 4.9+

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
\`\`\`

### Running in Development
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VS Code window

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

---

**Made with ❤️ for the Bengali developer community**
