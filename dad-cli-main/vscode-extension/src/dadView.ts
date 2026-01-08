import * as vscode from "vscode";

export class DadViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView) {
    view.webview.options = {
      enableScripts: true
    };

    view.webview.html = `
      <!DOCTYPE html>
      <html>
        <body>
          <h3>DAD Agent</h3>
          <button id="start">▶ Start DAD Test</button>

          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById("start").onclick = () => {
              vscode.postMessage({ command: "start" });
            };
          </script>
        </body>
      </html>
    `;

    view.webview.onDidReceiveMessage(msg => {
      if (msg.command === "start") {
        vscode.commands.executeCommand("dad.start");
      }
    });
  }
}
