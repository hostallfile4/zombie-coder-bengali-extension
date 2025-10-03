# ZombieCoder System Architecture

## Overview

ZombieCoder is a comprehensive AI-powered coding assistant with Bengali language support, featuring a VS Code extension, gateway server, and multiple specialized AI agents.

## System Components

### 1. VS Code Extension (Client)
- **Location**: `src/`
- **Port**: N/A (runs in VS Code)
- **Features**:
  - Copilot-style sidebar chat interface
  - Real-time streaming responses
  - Local/Server mode toggle
  - File upload and context injection
  - Settings management

### 2. Gateway Server
- **Location**: `server/gateway.ts`
- **Port**: 8001
- **Responsibilities**:
  - Main entry point for all AI requests
  - Routes requests to appropriate backends (Ollama or Agents)
  - Handles streaming via Server-Sent Events (SSE)
  - Model management and discovery
  - Health monitoring

### 3. AI Agents (Microservices)
- **Bengali NLP Agent** (Port 8002): Bengali language processing
- **Code Generator Agent** (Port 8003): Code generation and completion
- **Code Review Agent** (Port 8004): Code analysis and review
- **Documentation Agent** (Port 8005): Documentation generation
- **Testing Agent** (Port 8006): Test generation
- **Deployment Agent** (Port 8007): Deployment assistance
- **Voice Processor Agent** (Port 8014): Voice command processing

### 4. Local Models (Ollama)
- **Port**: 11434
- **Models**: codellama, llama2, mistral
- **Purpose**: Offline/local inference

### 5. Web Dashboard (Next.js)
- **Port**: 3000
- **Features**:
  - System overview and monitoring
  - MCP Manager
  - File Indexer
  - Agent management
  - Voice system monitoring
  - Extension builder

## Data Flow

\`\`\`
User Input (VS Code Extension)
    ↓
Gateway Server (8001)
    ↓
    ├─→ Ollama (11434) [Local Mode]
    │   └─→ codellama/llama2/mistral
    │
    └─→ AI Agents (8002-8014) [Server Mode]
        ├─→ Bengali NLP (8002)
        ├─→ Code Generator (8003)
        ├─→ Code Review (8004)
        └─→ Other Agents...
    ↓
Streaming Response (SSE)
    ↓
VS Code Extension UI Update
\`\`\`

## API Endpoints

### Gateway Server (8001)

#### Health Check
\`\`\`
GET /health
Response: { status: "healthy", timestamp: "...", services: {...} }
\`\`\`

#### List Models
\`\`\`
GET /v1/models
Response: { data: [{ id: "codellama", provider: "ollama", type: "local" }, ...] }
\`\`\`

#### Chat Completions (Streaming)
\`\`\`
POST /v1/chat/completions
Headers: { Authorization: "Bearer zombiecoder-gateway-token" }
Body: {
  model: "codellama",
  messages: [{ role: "user", content: "..." }],
  stream: true
}
Response: Server-Sent Events (SSE)
\`\`\`

## Configuration

### VS Code Extension Settings
- `zombiecoder.mode`: "local" | "server"
- `zombiecoder.serverUrl`: Gateway server URL
- `zombiecoder.ollamaUrl`: Ollama server URL
- `zombiecoder.apiKey`: API authentication key
- `zombiecoder.defaultModel`: Default AI model
- `zombiecoder.enableStreaming`: Enable/disable streaming

### Environment Variables
See `.env.example` for complete configuration options.

## Development

### Start Gateway Server
\`\`\`bash
npm run gateway
\`\`\`

### Start Code Generator Agent
\`\`\`bash
npm run agent:codegen
\`\`\`

### Start All Services
\`\`\`bash
npm run dev:all
\`\`\`

### Build Extension
\`\`\`bash
npm run vsix
\`\`\`

## Testing

### Backend Health Check
\`\`\`bash
curl http://localhost:8001/health
\`\`\`

### Test Streaming
\`\`\`bash
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer zombiecoder-gateway-token" \
  -d '{
    "model": "codellama",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
\`\`\`

## Security

- API key authentication for gateway access
- CORS configuration for web dashboard
- Environment variable management for sensitive data
- Local-first approach with optional server mode

## Performance Targets

- Chat response: < 2s
- Code completion: < 500ms
- Streaming latency: < 100ms
- Extension activation: < 1s
