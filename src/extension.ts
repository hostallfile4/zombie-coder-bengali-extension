import * as vscode from "vscode"
import { SidebarProvider } from "./sidebarProvider"

export function activate(context: vscode.ExtensionContext) {
  console.log("ZombieCoder Bengali Extension is now active!")

  // Create sidebar provider
  const sidebarProvider = new SidebarProvider(context.extensionUri)

  // Register webview view provider
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("zombiecoderSidebar", sidebarProvider))

  // Set context for when extension is enabled
  vscode.commands.executeCommand("setContext", "zombiecoderEnabled", true)

  // Register commands
  const openSidebarCommand = vscode.commands.registerCommand("zombiecoder.openSidebar", () => {
    vscode.commands.executeCommand("workbench.view.extension.zombiecoder")
  })

  const toggleModeCommand = vscode.commands.registerCommand("zombiecoder.toggleMode", async () => {
    const config = vscode.workspace.getConfiguration("zombiecoder")
    const currentMode = config.get("mode", "local")
    const newMode = currentMode === "local" ? "server" : "local"

    await config.update("mode", newMode, vscode.ConfigurationTarget.Global)

    // Update status bar and refresh sidebar
    updateStatusBar(newMode)
    sidebarProvider.refresh()

    vscode.window.showInformationMessage(`Switched to ${newMode.toUpperCase()} mode`)
  })

  const openSettingsCommand = vscode.commands.registerCommand("zombiecoder.openSettings", () => {
    vscode.commands.executeCommand("workbench.action.openSettings", "zombiecoder")
  })

  const refreshAgentsCommand = vscode.commands.registerCommand("zombiecoder.refreshAgents", () => {
    sidebarProvider.refresh()
    vscode.window.showInformationMessage("Agents refreshed")
  })

  const startGatewayCommand = vscode.commands.registerCommand("zombiecoder.startGateway", async () => {
    const terminal = vscode.window.createTerminal("ZombieCoder Gateway")
    terminal.sendText("npm run gateway")
    terminal.show()
    vscode.window.showInformationMessage("Gateway server starting on port 8001...")
  })

  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  const config = vscode.workspace.getConfiguration("zombiecoder")
  const currentMode = config.get("mode", "local")
  updateStatusBar(currentMode)
  statusBarItem.show()

  function updateStatusBar(mode: string) {
    statusBarItem.text = `$(robot) ZombieCoder: ${mode.toUpperCase()}`
    statusBarItem.tooltip = `ZombieCoder is running in ${mode} mode. Click to toggle.`
    statusBarItem.command = "zombiecoder.toggleMode"
  }

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("zombiecoder.mode")) {
      const newMode = vscode.workspace.getConfiguration("zombiecoder").get("mode", "local")
      updateStatusBar(newMode)
      sidebarProvider.refresh()
    }
  })

  context.subscriptions.push(
    openSidebarCommand,
    toggleModeCommand,
    openSettingsCommand,
    refreshAgentsCommand,
    startGatewayCommand,
    statusBarItem,
    configChangeListener,
  )
}

export function deactivate() {
  console.log("ZombieCoder Bengali Extension is now deactivated")
}
