import * as vscode from "vscode"

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView
  _doc?: vscode.TextDocument

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "sendMessage": {
          await this.handleSendMessage(data.message, data.mode, data.agent, data.provider)
          break
        }
        case "uploadFile": {
          await this.handleFileUpload()
          break
        }
        case "addContext": {
          await this.handleAddContext()
          break
        }
        case "newChat": {
          this.refresh()
          break
        }
        case "openSettings": {
          vscode.commands.executeCommand("zombiecoder.openSettings")
          break
        }
        case "openHistory": {
          vscode.window.showInformationMessage("History feature coming soon!")
          break
        }
      }
    })
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview)
    }
  }

  private async handleSendMessage(message: string, mode: string, agent: string, provider: string) {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const serverUrl = config.get("serverUrl", "http://127.0.0.1:8001")
    const ollamaUrl = config.get("ollamaUrl", "http://localhost:11434")
    const apiKey = config.get("apiKey", "zombiecoder-gateway-token")

    try {
      // Show typing indicator
      this._view?.webview.postMessage({ type: "showTyping" })

      const endpoint = mode === "local" ? `${ollamaUrl}/api/generate` : `${serverUrl}/v1/chat/completions`

      if (mode === "local") {
        // Ollama local mode
        await this.streamOllamaResponse(ollamaUrl, message, agent)
      } else {
        // Server mode with streaming
        await this.streamServerResponse(serverUrl, apiKey, message, agent)
      }
    } catch (error: any) {
      this._view?.webview.postMessage({
        type: "error",
        message: `Error: ${error.message}`,
      })
    }
  }

  private async streamOllamaResponse(ollamaUrl: string, prompt: string, model: string) {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "codellama",
        prompt: prompt,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("No response body")
    }

    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n").filter((line) => line.trim())

      for (const line of lines) {
        try {
          const json = JSON.parse(line)
          if (json.response) {
            fullResponse += json.response
            this._view?.webview.postMessage({
              type: "streamChunk",
              chunk: json.response,
            })
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    this._view?.webview.postMessage({ type: "streamComplete" })
  }

  private async streamServerResponse(serverUrl: string, apiKey: string, message: string, model: string) {
    const response = await fetch(`${serverUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Server request failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("No response body")
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n").filter((line) => line.trim() && line.startsWith("data: "))

      for (const line of lines) {
        const data = line.replace("data: ", "")
        if (data === "[DONE]") continue

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            this._view?.webview.postMessage({
              type: "streamChunk",
              chunk: content,
            })
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    this._view?.webview.postMessage({ type: "streamComplete" })
  }

  private async handleFileUpload() {
    const files = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: "Select files to upload",
    })

    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.fsPath.split("/").pop()).join(", ")
      this._view?.webview.postMessage({
        type: "filesUploaded",
        files: fileNames,
      })
    }
  }

  private async handleAddContext() {
    const editor = vscode.window.activeTextEditor
    if (editor) {
      const selection = editor.selection
      const text = editor.document.getText(selection)
      if (text) {
        this._view?.webview.postMessage({
          type: "contextAdded",
          context: text,
        })
      } else {
        vscode.window.showInformationMessage("No text selected")
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const mode = config.get("mode", "local")

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZombieCoder Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: var(--vscode-font-family);
        }

        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 12px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header-title {
            font-size: 16px;
            font-weight: 600;
        }

        .header-controls {
            display: flex;
            gap: 8px;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            background-color: var(--vscode-badge-background);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            background-color: #238636;
            border-radius: 50%;
            margin-right: 6px;
        }

        .header-button {
            background-color: var(--vscode-button-secondaryBackground);
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            color: var(--vscode-button-secondaryForeground);
            cursor: pointer;
            font-size: 11px;
        }

        .header-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 12px;
            padding: 8px;
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border);
        }

        .message {
            margin-bottom: 12px;
            padding: 8px 12px;
            border-radius: 6px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
        }

        .message.user {
            background-color: var(--vscode-button-background);
            border-color: var(--vscode-button-background);
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 11px;
            opacity: 0.7;
        }

        .message-content {
            line-height: 1.5;
            font-size: 13px;
        }

        .typing-indicator {
            display: none;
            align-items: center;
            padding: 8px 12px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 12px;
        }

        .typing-indicator.active {
            display: flex;
        }

        .typing-dots {
            display: flex;
            margin-left: 8px;
        }

        .typing-dot {
            width: 4px;
            height: 4px;
            background-color: var(--vscode-editor-foreground);
            border-radius: 50%;
            margin-right: 3px;
            animation: typing 1.4s infinite ease-in-out;
            opacity: 0.5;
        }

        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-3px); opacity: 1; }
        }

        .input-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 8px;
            padding: 8px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border);
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .control-label {
            font-size: 11px;
            opacity: 0.7;
        }

        .control-select {
            background-color: var(--vscode-dropdown-background);
            border: 1px solid var(--vscode-dropdown-border);
            border-radius: 2px;
            padding: 2px 6px;
            color: var(--vscode-dropdown-foreground);
            font-size: 11px;
            cursor: pointer;
        }

        .control-button {
            background-color: var(--vscode-button-secondaryBackground);
            border: none;
            border-radius: 2px;
            padding: 3px 8px;
            color: var(--vscode-button-secondaryForeground);
            font-size: 11px;
            cursor: pointer;
        }

        .control-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .input-container {
            position: relative;
            margin-bottom: 8px;
        }

        .agent-input {
            width: 100%;
            padding: 8px 36px 8px 8px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            color: var(--vscode-input-foreground);
            font-size: 13px;
            resize: none;
            min-height: 40px;
            max-height: 120px;
            overflow-y: auto;
        }

        .agent-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .send-button {
            position: absolute;
            right: 6px;
            bottom: 6px;
            background: var(--vscode-button-background);
            border: none;
            border-radius: 4px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .send-button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .send-icon {
            width: 14px;
            height: 14px;
            fill: var(--vscode-button-foreground);
        }

        .suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .suggestion {
            background-color: var(--vscode-button-secondaryBackground);
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 11px;
            cursor: pointer;
        }

        .suggestion:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .cursor {
            display: inline-block;
            width: 2px;
            height: 14px;
            background-color: var(--vscode-editor-foreground);
            margin-left: 2px;
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">ZombieCoder</div>
        <div class="header-controls">
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span>${mode.toUpperCase()}</span>
            </div>
            <button class="header-button" onclick="openHistory()">History</button>
            <button class="header-button" onclick="openSettings()">Settings</button>
            <button class="header-button" onclick="newChat()">New</button>
        </div>
    </div>

    <div class="chat-container">
        <div class="chat-messages" id="chatMessages">
            <div class="message">
                <div class="message-header">
                    <span>ZombieCoder</span>
                    <span>Just now</span>
                </div>
                <div class="message-content">
                    Welcome to ZombieCoder! I'm your AI coding assistant. How can I help you today?
                </div>
            </div>
        </div>

        <div class="typing-indicator" id="typingIndicator">
            <span>AI is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>

        <div class="input-controls">
            <div class="control-group">
                <span class="control-label">Mode:</span>
                <select class="control-select" id="modeSelect">
                    <option value="chat" selected>Chat</option>
                    <option value="code">Code</option>
                    <option value="review">Review</option>
                </select>
            </div>
            
            <div class="control-group">
                <span class="control-label">Agent:</span>
                <select class="control-select" id="agentSelect">
                    <option value="codellama">codellama</option>
                    <option value="llama2">llama2</option>
                    <option value="mistral">mistral</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="claude-3-sonnet">claude-3-sonnet</option>
                </select>
            </div>
            
            <div class="control-group">
                <span class="control-label">Provider:</span>
                <select class="control-select" id="providerSelect">
                    <option value="ollama">Ollama</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                </select>
            </div>
            
            <button class="control-button" onclick="uploadFile()">📎 File</button>
            <button class="control-button" onclick="addContext()">📄 Context</button>
        </div>

        <div class="input-container">
            <textarea class="agent-input" id="agentInput" placeholder="Ask me anything about coding..."></textarea>
            <button class="send-button" id="sendButton" onclick="sendMessage()">
                <svg class="send-icon" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
            </button>
        </div>

        <div class="suggestions">
            <div class="suggestion" onclick="useSuggestion('How do I fix this error?')">Fix error</div>
            <div class="suggestion" onclick="useSuggestion('Write a function')">Write function</div>
            <div class="suggestion" onclick="useSuggestion('Explain this code')">Explain code</div>
            <div class="suggestion" onclick="useSuggestion('Optimize this')">Optimize</div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentStreamingMessage = null;

        // Auto-resize textarea
        const agentInput = document.getElementById('agentInput');
        agentInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Send on Enter (Shift+Enter for new line)
        agentInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        function sendMessage() {
            const message = agentInput.value.trim();
            if (!message) return;

            const mode = document.getElementById('modeSelect').value;
            const agent = document.getElementById('agentSelect').value;
            const provider = document.getElementById('providerSelect').value;

            addMessage(message, 'user');
            agentInput.value = '';
            agentInput.style.height = 'auto';

            vscode.postMessage({
                type: 'sendMessage',
                message: message,
                mode: mode,
                agent: agent,
                provider: provider
            });
        }

        function addMessage(content, sender) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            
            messageDiv.innerHTML = \`
                <div class="message-header">
                    <span>\${sender === 'user' ? 'You' : 'ZombieCoder'}</span>
                    <span>Just now</span>
                </div>
                <div class="message-content">\${content}</div>
            \`;
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            return messageDiv;
        }

        function useSuggestion(text) {
            agentInput.value = text;
            agentInput.focus();
            agentInput.dispatchEvent(new Event('input'));
        }

        function uploadFile() {
            vscode.postMessage({ type: 'uploadFile' });
        }

        function addContext() {
            vscode.postMessage({ type: 'addContext' });
        }

        function newChat() {
            vscode.postMessage({ type: 'newChat' });
        }

        function openSettings() {
            vscode.postMessage({ type: 'openSettings' });
        }

        function openHistory() {
            vscode.postMessage({ type: 'openHistory' });
        }

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'showTyping':
                    document.getElementById('typingIndicator').classList.add('active');
                    currentStreamingMessage = addMessage('', 'assistant');
                    break;
                    
                case 'streamChunk':
                    if (currentStreamingMessage) {
                        const content = currentStreamingMessage.querySelector('.message-content');
                        content.innerHTML += message.chunk;
                        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
                    }
                    break;
                    
                case 'streamComplete':
                    document.getElementById('typingIndicator').classList.remove('active');
                    currentStreamingMessage = null;
                    break;
                    
                case 'error':
                    document.getElementById('typingIndicator').classList.remove('active');
                    addMessage(message.message, 'system');
                    currentStreamingMessage = null;
                    break;
                    
                case 'filesUploaded':
                    addMessage('Uploaded: ' + message.files, 'system');
                    break;
                    
                case 'contextAdded':
                    agentInput.value += '\\n\\nContext:\\n' + message.context;
                    agentInput.dispatchEvent(new Event('input'));
                    break;
            }
        });
    </script>
</body>
</html>`
  }
}
