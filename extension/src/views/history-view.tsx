import type * as vscode from "vscode"
import type { DatabaseService } from "../services/database"

export class HistoryViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly database: DatabaseService,
  ) {}

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

    // Load history
    this.loadHistory()

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "deleteItem":
          await this.database.deleteChatHistoryItem(data.id)
          this.loadHistory()
          break
        case "clearAll":
          await this.database.clearChatHistory()
          this.loadHistory()
          break
        case "refresh":
          this.loadHistory()
          break
      }
    })
  }

  private async loadHistory() {
    if (!this._view) return

    const history = await this.database.getChatHistory()
    this._view.webview.postMessage({
      type: "historyData",
      data: history,
    })
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat History</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 16px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .title {
            font-size: 14px;
            font-weight: 600;
        }
        .actions {
            display: flex;
            gap: 8px;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 11px;
            cursor: pointer;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .history-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .history-item {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            padding: 12px;
        }
        .history-message {
            font-size: 13px;
            margin-bottom: 8px;
            font-weight: 500;
        }
        .history-response {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
        .history-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
        .delete-btn {
            background-color: transparent;
            color: var(--vscode-errorForeground);
            padding: 2px 6px;
        }
        .empty-state {
            text-align: center;
            padding: 32px 16px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Chat History</div>
        <div class="actions">
            <button id="refreshBtn">Refresh</button>
            <button id="clearBtn">Clear All</button>
        </div>
    </div>
    
    <div class="history-list" id="historyList">
        <div class="empty-state">No chat history yet</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const historyList = document.getElementById('historyList');
        const refreshBtn = document.getElementById('refreshBtn');
        const clearBtn = document.getElementById('clearBtn');

        refreshBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'refresh' });
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all chat history?')) {
                vscode.postMessage({ type: 'clearAll' });
            }
        });

        function renderHistory(history) {
            if (!history || history.length === 0) {
                historyList.innerHTML = '<div class="empty-state">No chat history yet</div>';
                return;
            }

            historyList.innerHTML = history.map(item => \`
                <div class="history-item">
                    <div class="history-message">\${escapeHtml(item.message)}</div>
                    <div class="history-response">\${escapeHtml(item.response.substring(0, 100))}...</div>
                    <div class="history-footer">
                        <span>\${new Date(item.timestamp).toLocaleString()}</span>
                        <button class="delete-btn" onclick="deleteItem(\${item.id})">Delete</button>
                    </div>
                </div>
            \`).join('');
        }

        function deleteItem(id) {
            vscode.postMessage({ type: 'deleteItem', id: id });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'historyData') {
                renderHistory(message.data);
            }
        });
    </script>
</body>
</html>`
  }
}
