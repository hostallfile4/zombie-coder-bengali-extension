import * as vscode from "vscode"
import { ZombieCoderClient } from "./client"
import { ChatViewProvider } from "./views/chat-view"
import { HistoryViewProvider } from "./views/history-view"
import { DatabaseService } from "./services/database"

let client: ZombieCoderClient
let databaseService: DatabaseService

export async function activate(context: vscode.ExtensionContext) {
  console.log("ZombieCoder Bengali extension is now active")

  // Initialize database service
  databaseService = new DatabaseService(context)
  await databaseService.initialize()

  // Initialize client
  const config = vscode.workspace.getConfiguration("zombiecoder")
  client = new ZombieCoderClient(config.get("gatewayUrl") || "http://localhost:8001", config.get("apiKey") || "")

  // Register chat view
  const chatProvider = new ChatViewProvider(context.extensionUri, client, databaseService)
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("zombiecoder.chatView", chatProvider))

  // Register history view
  const historyProvider = new HistoryViewProvider(context.extensionUri, databaseService)
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("zombiecoder.historyView", historyProvider))

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.chat", () => {
      vscode.commands.executeCommand("workbench.view.extension.zombiecoder")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.voiceCommand", async () => {
      const result = await vscode.window.showInputBox({
        prompt: "Speak your command in Bengali (simulated)",
        placeHolder: "কোড লিখুন...",
      })
      if (result) {
        chatProvider.sendMessage(result)
      }
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.generateCode", async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showErrorMessage("No active editor")
        return
      }

      const prompt = await vscode.window.showInputBox({
        prompt: "What code would you like to generate?",
        placeHolder: "e.g., Create a function to sort an array",
      })

      if (prompt) {
        const response = await client.generateCode(prompt)
        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, response.code)
        })
      }
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.reviewCode", async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showErrorMessage("No active editor")
        return
      }

      const selection = editor.document.getText(editor.selection)
      if (!selection) {
        vscode.window.showErrorMessage("No code selected")
        return
      }

      const review = await client.reviewCode(selection)
      vscode.window.showInformationMessage(review.summary)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.explainCode", async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showErrorMessage("No active editor")
        return
      }

      const selection = editor.document.getText(editor.selection)
      if (!selection) {
        vscode.window.showErrorMessage("No code selected")
        return
      }

      const explanation = await client.explainCode(selection)
      chatProvider.showExplanation(explanation)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("zombiecoder.openAdmin", () => {
      vscode.env.openExternal(vscode.Uri.parse("http://localhost:3000"))
    }),
  )

  vscode.window.showInformationMessage("ZombieCoder Bengali is ready!")
}

export function deactivate() {
  if (databaseService) {
    databaseService.close()
  }
}
