import * as vscode from "vscode"
import { getNonce } from "./utils"

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "zombiecoderSidebar"
  private _view?: vscode.WebviewView

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "sendMessage":
          await this.handleUserMessage(data.message)
          break
        case "selectAgent":
          await this.selectAgent(data.agent)
          break
        case "toggleMode":
          vscode.commands.executeCommand("zombiecoder.toggleMode")
          break
        case "openSettings":
          vscode.commands.executeCommand("zombiecoder.openSettings")
          break
      }
    })
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview)
    }
  }

  private async handleUserMessage(message: string) {
    if (!this._view) return

    const config = vscode.workspace.getConfiguration("zombiecoder")
    const mode = config.get("mode", "local")
    const selectedAgent = config.get("selectedAgent", "general-assistant")

    // Show typing indicator
    this._view.webview.postMessage({
      type: "showTyping",
    })

    try {
      let response: string

      if (mode === "local") {
        response = await this.processLocalMessage(message)
      } else {
        response = await this.processServerMessage(message, selectedAgent)
      }

      // Send response back to webview
      this._view.webview.postMessage({
        type: "addMessage",
        message: {
          text: response,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      this._view.webview.postMessage({
        type: "addMessage",
        message: {
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          isUser: false,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      })
    } finally {
      this._view.webview.postMessage({
        type: "hideTyping",
      })
    }
  }

  private async processLocalMessage(message: string): Promise<string> {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const ollamaUrl = config.get("ollamaUrl", "http://localhost:11434")

    // Simple Ollama API call
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "codellama",
        prompt: message,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Local model error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || "No response from local model"
  }

  private async processServerMessage(message: string, agent: string): Promise<string> {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const serverUrl = config.get("serverUrl", "http://localhost:12345")

    const response = await fetch(`${serverUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        agent,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || "No response from server"
  }

  private async selectAgent(agent: string) {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    await config.update("selectedAgent", agent, vscode.ConfigurationTarget.Global)

    if (this._view) {
      this._view.webview.postMessage({
        type: "agentSelected",
        agent,
      })
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce()
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const mode = config.get("mode", "local")
    const selectedAgent = config.get("selectedAgent", "general-assistant")

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZombieCoder Assistant</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-sideBar-background);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .header {
                    padding: 12px;
                    border-bottom: 1px solid var(--vscode-sideBar-border);
                    background-color: var(--vscode-sideBarSectionHeader-background);
                }
                
                .mode-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                
                .mode-badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .mode-local {
                    background-color: var(--vscode-charts-green);
                    color: var(--vscode-sideBar-background);
                }
                
                .mode-server {
                    background-color: var(--vscode-charts-blue);
                    color: var(--vscode-sideBar-background);
                }
                
                .agent-selector {
                    margin-top: 8px;
                }
                
                .agent-select {
                    width: 100%;
                    padding: 4px 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-size: 12px;
                }
                
                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .message {
                    max-width: 100%;
                    word-wrap: break-word;
                }
                
                .message.user {
                    align-self: flex-end;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    padding: 8px 12px;
                    border-radius: 12px 12px 4px 12px;
                    max-width: 80%;
                }
                
                .message.assistant {
                    align-self: flex-start;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    padding: 8px 12px;
                    border-radius: 12px 12px 12px 4px;
                    max-width: 80%;
                    border: 1px solid var(--vscode-input-border);
                }
                
                .message.error {
                    background-color: var(--vscode-inputValidation-errorBackground);
                    color: var(--vscode-inputValidation-errorForeground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                }
                
                .typing-indicator {
                    align-self: flex-start;
                    padding: 8px 12px;
                    background-color: var(--vscode-input-background);
                    border-radius: 12px 12px 12px 4px;
                    border: 1px solid var(--vscode-input-border);
                    display: none;
                }
                
                .typing-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: var(--vscode-foreground);
                    opacity: 0.4;
                    animation: typing 1.4s infinite;
                }
                
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes typing {
                    0%, 60%, 100% { opacity: 0.4; }
                    30% { opacity: 1; }
                }
                
                .input-container {
                    padding: 12px;
                    border-top: 1px solid var(--vscode-sideBar-border);
                    background-color: var(--vscode-sideBar-background);
                }
                
                .input-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                }
                
                .message-input {
                    flex: 1;
                    min-height: 32px;
                    max-height: 100px;
                    padding: 6px 12px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 16px;
                    resize: none;
                    font-family: inherit;
                    font-size: inherit;
                    outline: none;
                }
                
                .message-input:focus {
                    border-color: var(--vscode-focusBorder);
                }
                
                .send-button {
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 50%;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                
                .send-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .welcome-message {
                    text-align: center;
                    padding: 20px;
                    color: var(--vscode-descriptionForeground);
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="mode-indicator">
                    <span class="mode-badge ${mode === "local" ? "mode-local" : "mode-server"}" id="modeIndicator">
                        ${mode}
                    </span>
                    <span style="font-size: 12px; color: var(--vscode-descriptionForeground);">
                        ${mode === "local" ? "Local Model" : "Server Mode"}
                    </span>
                </div>
                
                ${
                  mode === "server"
                    ? `
                <div class="agent-selector">
                    <select class="agent-select" id="agentSelect">
                        <option value="general-assistant" ${selectedAgent === "general-assistant" ? "selected" : ""}>General Assistant</option>
                        <option value="code-reviewer" ${selectedAgent === "code-reviewer" ? "selected" : ""}>Code Reviewer</option>
                        <option value="bug-fixer" ${selectedAgent === "bug-fixer" ? "selected" : ""}>Bug Fixer</option>
                        <option value="documentation" ${selectedAgent === "documentation" ? "selected" : ""}>Documentation</option>
                        <option value="translator" ${selectedAgent === "translator" ? "selected" : ""}>Translator</option>
                    </select>
                </div>
                `
                    : ""
                }
            </div>
            
            <div class="chat-container">
                <div class="messages" id="messages">
                    <div class="welcome-message">
                        <p>👋 Hello! I'm your ZombieCoder Assistant.</p>
                        <p>Currently running in <strong>${mode.toUpperCase()}</strong> mode.</p>
                        <p>How can I help you with your code today?</p>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            
            <div class="input-container">
                <div class="input-wrapper">
                    <textarea 
                        class="message-input" 
                        id="messageInput" 
                        placeholder="Ask me anything about your code..."
                        rows="1"
                    ></textarea>
                    <button class="send-button" id="sendButton">
                        ➤
                    </button>
                </div>
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                const messagesContainer = document.getElementById('messages');
                const messageInput = document.getElementById('messageInput');
                const sendButton = document.getElementById('sendButton');
                const typingIndicator = document.getElementById('typingIndicator');
                const agentSelect = document.getElementById('agentSelect');
                
                // Auto-resize textarea
                messageInput.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
                });
                
                // Send message
                function sendMessage() {
                    const message = messageInput.value.trim();
                    if (!message) return;
                    
                    // Add user message to chat
                    addMessage(message, true);
                    
                    // Clear input
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                    
                    // Send to extension
                    vscode.postMessage({
                        type: 'sendMessage',
                        message: message
                    });
                }
                
                // Add message to chat
                function addMessage(text, isUser = false, isError = false) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\${isError ? ' error' : ''}\`;
                    messageDiv.textContent = text;
                    
                    messagesContainer.appendChild(messageDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
                
                // Event listeners
                sendButton.addEventListener('click', sendMessage);
                
                messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
                
                if (agentSelect) {
                    agentSelect.addEventListener('change', (e) => {
                        vscode.postMessage({
                            type: 'selectAgent',
                            agent: e.target.value
                        });
                    });
                }
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'addMessage':
                            addMessage(message.message.text, message.message.isUser, message.message.isError);
                            break;
                        case 'showTyping':
                            typingIndicator.style.display = 'block';
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            break;
                        case 'hideTyping':
                            typingIndicator.style.display = 'none';
                            break;
                        case 'agentSelected':
                            if (agentSelect) {
                                agentSelect.value = message.agent;
                            }
                            break;
                    }
                });
            </script>
        </body>
        </html>`
  }
}
