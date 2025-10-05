import * as vscode from "vscode"

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private async handleMessage(message: string) {
    if (!this._view) return

    try {
      // Show typing indicator
      this._view.webview.postMessage({ type: "typing", value: true })

      const config = vscode.workspace.getConfiguration("zombiecoder")
      const useStreaming = config.get("enableStreaming", true)

      if (useStreaming) {
        let fullResponse = ""

        // Start streaming response
        this._view.webview.postMessage({
          type: "streamStart",
        })

        try {
          for await (const chunk of this.client.chatStream(message)) {
            fullResponse += chunk
            this._view.webview.postMessage({
              type: "streamChunk",
              content: chunk,
            })
          }

          // Save to database
          await this.database.saveChatHistory(message, fullResponse)

          this._view.webview.postMessage({
            type: "streamEnd",
          })
        } catch (streamError) {
          // Fallback to non-streaming
          const response = await this.client.chat(message)
          await this.database.saveChatHistory(message, response.message)
          this._view.webview.postMessage({
            type: "response",
            message: response.message,
          })
        }
      } else {
        // Non-streaming mode
        const response = await this.client.chat(message)
        await this.database.saveChatHistory(message, response.message)
        this._view.webview.postMessage({
          type: "response",
          message: response.message,
        })
      }
    } catch (error) {
      this._view.webview.postMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      this._view.webview.postMessage({ type: "typing", value: false })
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZombieCoder Chat</title>
    <style>
        
        /* Added streaming cursor animation */
        .streaming-cursor {
            display: inline-block;
            width: 2px;
            height: 1em;
            background-color: var(--vscode-foreground);
            margin-left: 2px;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
    </style>
</head>
<body>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const typingIndicator = document.getElementById('typing');
        
        let currentStreamingMessage = null;


        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'response':
                    addMessage(message.message, 'assistant');
                    break;
                case 'streamStart':
                    currentStreamingMessage = createStreamingMessage();
                    break;
                case 'streamChunk':
                    if (currentStreamingMessage) {
                        appendToStreamingMessage(currentStreamingMessage, message.content);
                    }
                    break;
                case 'streamEnd':
                    if (currentStreamingMessage) {
                        finalizeStreamingMessage(currentStreamingMessage);
                        currentStreamingMessage = null;
                    }
                    break;
                case 'error':
                    addMessage('Error: ' + message.message, 'assistant');
                    break;
                case 'typing':
                    if (message.value) {
                        typingIndicator.classList.add('active');
                    } else {
                        typingIndicator.classList.remove('active');
                    }
                    break;
            }
        });
        
        function createStreamingMessage() {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message message-assistant';
            
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.innerHTML = '<span class="streaming-cursor"></span>';
            
            messageDiv.appendChild(bubble);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return bubble;
        }
        
        function appendToStreamingMessage(bubble, content) {
            const cursor = bubble.querySelector('.streaming-cursor');
            const textNode = document.createTextNode(content);
            bubble.insertBefore(textNode, cursor);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function finalizeStreamingMessage(bubble) {
            const cursor = bubble.querySelector('.streaming-cursor');
            if (cursor) {
                cursor.remove();
            }
        }
    </script>
</body>
</html>`
  }
}
