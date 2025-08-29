import * as vscode from "vscode"
import { getNonce } from "./utils"

export class SettingsProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "zombiecoderSettings"
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
        case "updateSetting":
          await this.updateSetting(data.key, data.value)
          break
        case "testConnection":
          await this.testConnection(data.mode)
          break
        case "resetSettings":
          await this.resetSettings()
          break
      }
    })
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview)
    }
  }

  private async updateSetting(key: string, value: any) {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    await config.update(key, value, vscode.ConfigurationTarget.Global)

    vscode.window.showInformationMessage(`Setting updated: ${key}`)
    this.refresh()
  }

  private async testConnection(mode: string) {
    if (!this._view) return

    const config = vscode.workspace.getConfiguration("zombiecoder")

    try {
      if (mode === "local") {
        const ollamaUrl = config.get("ollamaUrl", "http://localhost:11434")
        const response = await fetch(`${ollamaUrl}/api/tags`)

        if (response.ok) {
          this._view.webview.postMessage({
            type: "connectionResult",
            success: true,
            message: "Local Ollama connection successful!",
          })
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } else {
        const serverUrl = config.get("serverUrl", "http://localhost:12345")
        const response = await fetch(`${serverUrl}/api/health`)

        if (response.ok) {
          this._view.webview.postMessage({
            type: "connectionResult",
            success: true,
            message: "Server connection successful!",
          })
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }
    } catch (error) {
      this._view.webview.postMessage({
        type: "connectionResult",
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  private async resetSettings() {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const settings = [
      "mode",
      "selectedAgent",
      "ollamaUrl",
      "ollamaModel",
      "serverUrl",
      "serverApiKey",
      "autoStart",
      "showStatusBar",
      "enableVoiceCommands",
      "responseLanguage",
      "maxTokens",
      "temperature",
      "enableLogging",
      "logLevel",
    ]

    for (const setting of settings) {
      await config.update(setting, undefined, vscode.ConfigurationTarget.Global)
    }

    vscode.window.showInformationMessage("All settings have been reset to defaults")
    this.refresh()
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce()
    const config = vscode.workspace.getConfiguration("zombiecoder")

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZombieCoder Settings</title>
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
                    padding: 16px;
                }
                
                .settings-section {
                    margin-bottom: 24px;
                    padding: 16px;
                    background-color: var(--vscode-sideBarSectionHeader-background);
                    border-radius: 6px;
                    border: 1px solid var(--vscode-sideBar-border);
                }
                
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--vscode-sideBarSectionHeader-foreground);
                }
                
                .setting-item {
                    margin-bottom: 16px;
                }
                
                .setting-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 4px;
                    color: var(--vscode-foreground);
                }
                
                .setting-description {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 6px;
                }
                
                .setting-input {
                    width: 100%;
                    padding: 6px 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-size: 12px;
                }
                
                .setting-input:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                }
                
                .setting-select {
                    width: 100%;
                    padding: 6px 8px;
                    background-color: var(--vscode-dropdown-background);
                    color: var(--vscode-dropdown-foreground);
                    border: 1px solid var(--vscode-dropdown-border);
                    border-radius: 4px;
                    font-size: 12px;
                }
                
                .setting-checkbox {
                    margin-right: 8px;
                }
                
                .checkbox-container {
                    display: flex;
                    align-items: center;
                }
                
                .button {
                    padding: 6px 12px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                
                .button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .button.secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                
                .button.secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                
                .connection-status {
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-top: 8px;
                    display: none;
                }
                
                .connection-status.success {
                    background-color: var(--vscode-inputValidation-infoBackground);
                    color: var(--vscode-inputValidation-infoForeground);
                    border: 1px solid var(--vscode-inputValidation-infoBorder);
                }
                
                .connection-status.error {
                    background-color: var(--vscode-inputValidation-errorBackground);
                    color: var(--vscode-inputValidation-errorForeground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                }
                
                .range-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .range-input {
                    flex: 1;
                }
                
                .range-value {
                    min-width: 40px;
                    text-align: center;
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="settings-section">
                <div class="section-title">🔧 General Settings</div>
                
                <div class="setting-item">
                    <label class="setting-label">Mode</label>
                    <div class="setting-description">Choose between Local Model or Server Mode</div>
                    <select class="setting-select" id="mode" onchange="updateSetting('mode', this.value)">
                        <option value="local" ${config.get("mode") === "local" ? "selected" : ""}>Local (Ollama)</option>
                        <option value="server" ${config.get("mode") === "server" ? "selected" : ""}>Server</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <div class="checkbox-container">
                        <input type="checkbox" class="setting-checkbox" id="autoStart" 
                               ${config.get("autoStart") ? "checked" : ""} 
                               onchange="updateSetting('autoStart', this.checked)">
                        <label class="setting-label" for="autoStart">Auto-start on VS Code launch</label>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="checkbox-container">
                        <input type="checkbox" class="setting-checkbox" id="showStatusBar" 
                               ${config.get("showStatusBar") ? "checked" : ""} 
                               onchange="updateSetting('showStatusBar', this.checked)">
                        <label class="setting-label" for="showStatusBar">Show status bar indicator</label>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="section-title">🤖 Local Mode Settings</div>
                
                <div class="setting-item">
                    <label class="setting-label">Ollama Server URL</label>
                    <div class="setting-description">URL of your local Ollama server</div>
                    <input type="text" class="setting-input" id="ollamaUrl" 
                           value="${config.get("ollamaUrl", "http://localhost:11434")}"
                           onchange="updateSetting('ollamaUrl', this.value)">
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">Ollama Model</label>
                    <div class="setting-description">Model name to use with Ollama</div>
                    <input type="text" class="setting-input" id="ollamaModel" 
                           value="${config.get("ollamaModel", "codellama")}"
                           onchange="updateSetting('ollamaModel', this.value)">
                </div>
                
                <button class="button" onclick="testConnection('local')">Test Local Connection</button>
            </div>
            
            <div class="settings-section">
                <div class="section-title">🌐 Server Mode Settings</div>
                
                <div class="setting-item">
                    <label class="setting-label">Server URL</label>
                    <div class="setting-description">URL of your ZombieCoder server</div>
                    <input type="text" class="setting-input" id="serverUrl" 
                           value="${config.get("serverUrl", "http://localhost:12345")}"
                           onchange="updateSetting('serverUrl', this.value)">
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">API Key</label>
                    <div class="setting-description">API key for server authentication (if required)</div>
                    <input type="password" class="setting-input" id="serverApiKey" 
                           value="${config.get("serverApiKey", "")}"
                           onchange="updateSetting('serverApiKey', this.value)">
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">Default Agent</label>
                    <div class="setting-description">Default AI agent for server mode</div>
                    <select class="setting-select" id="selectedAgent" onchange="updateSetting('selectedAgent', this.value)">
                        <option value="general-assistant" ${config.get("selectedAgent") === "general-assistant" ? "selected" : ""}>General Assistant</option>
                        <option value="code-reviewer" ${config.get("selectedAgent") === "code-reviewer" ? "selected" : ""}>Code Reviewer</option>
                        <option value="bug-fixer" ${config.get("selectedAgent") === "bug-fixer" ? "selected" : ""}>Bug Fixer</option>
                        <option value="documentation" ${config.get("selectedAgent") === "documentation" ? "selected" : ""}>Documentation</option>
                        <option value="translator" ${config.get("selectedAgent") === "translator" ? "selected" : ""}>Translator</option>
                    </select>
                </div>
                
                <button class="button" onclick="testConnection('server')">Test Server Connection</button>
            </div>
            
            <div class="settings-section">
                <div class="section-title">🎛️ AI Settings</div>
                
                <div class="setting-item">
                    <label class="setting-label">Response Language</label>
                    <div class="setting-description">Language for AI responses</div>
                    <select class="setting-select" id="responseLanguage" onchange="updateSetting('responseLanguage', this.value)">
                        <option value="english" ${config.get("responseLanguage") === "english" ? "selected" : ""}>English</option>
                        <option value="bengali" ${config.get("responseLanguage") === "bengali" ? "selected" : ""}>Bengali</option>
                        <option value="auto" ${config.get("responseLanguage") === "auto" ? "selected" : ""}>Auto-detect</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">Max Tokens</label>
                    <div class="setting-description">Maximum tokens for AI responses (256-8192)</div>
                    <div class="range-container">
                        <input type="range" class="range-input" id="maxTokens" 
                               min="256" max="8192" step="256"
                               value="${config.get("maxTokens", 2048)}"
                               onchange="updateSetting('maxTokens', parseInt(this.value)); document.getElementById('maxTokensValue').textContent = this.value">
                        <span class="range-value" id="maxTokensValue">${config.get("maxTokens", 2048)}</span>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">Temperature</label>
                    <div class="setting-description">AI creativity level (0.0 = focused, 2.0 = creative)</div>
                    <div class="range-container">
                        <input type="range" class="range-input" id="temperature" 
                               min="0" max="2" step="0.1"
                               value="${config.get("temperature", 0.7)}"
                               onchange="updateSetting('temperature', parseFloat(this.value)); document.getElementById('temperatureValue').textContent = this.value">
                        <span class="range-value" id="temperatureValue">${config.get("temperature", 0.7)}</span>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="section-title">🔧 Advanced Settings</div>
                
                <div class="setting-item">
                    <div class="checkbox-container">
                        <input type="checkbox" class="setting-checkbox" id="enableVoiceCommands" 
                               ${config.get("enableVoiceCommands") ? "checked" : ""} 
                               onchange="updateSetting('enableVoiceCommands', this.checked)">
                        <label class="setting-label" for="enableVoiceCommands">Enable Bengali voice commands (experimental)</label>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="checkbox-container">
                        <input type="checkbox" class="setting-checkbox" id="enableLogging" 
                               ${config.get("enableLogging") ? "checked" : ""} 
                               onchange="updateSetting('enableLogging', this.checked)">
                        <label class="setting-label" for="enableLogging">Enable detailed logging</label>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">Log Level</label>
                    <div class="setting-description">Logging verbosity level</div>
                    <select class="setting-select" id="logLevel" onchange="updateSetting('logLevel', this.value)">
                        <option value="error" ${config.get("logLevel") === "error" ? "selected" : ""}>Error</option>
                        <option value="warn" ${config.get("logLevel") === "warn" ? "selected" : ""}>Warning</option>
                        <option value="info" ${config.get("logLevel") === "info" ? "selected" : ""}>Info</option>
                        <option value="debug" ${config.get("logLevel") === "debug" ? "selected" : ""}>Debug</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="section-title">⚙️ Actions</div>
                <button class="button secondary" onclick="resetSettings()">Reset All Settings</button>
                <button class="button" onclick="window.open('https://github.com/zombiecoder/bengali-extension')">View Documentation</button>
            </div>
            
            <div class="connection-status" id="connectionStatus"></div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                function updateSetting(key, value) {
                    vscode.postMessage({
                        type: 'updateSetting',
                        key: key,
                        value: value
                    });
                }
                
                function testConnection(mode) {
                    vscode.postMessage({
                        type: 'testConnection',
                        mode: mode
                    });
                }
                
                function resetSettings() {
                    if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        vscode.postMessage({
                            type: 'resetSettings'
                        });
                    }
                }
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'connectionResult':
                            const statusDiv = document.getElementById('connectionStatus');
                            statusDiv.textContent = message.message;
                            statusDiv.className = \`connection-status \${message.success ? 'success' : 'error'}\`;
                            statusDiv.style.display = 'block';
                            
                            setTimeout(() => {
                                statusDiv.style.display = 'none';
                            }, 5000);
                            break;
                    }
                });
            </script>
        </body>
        </html>`
  }
}
