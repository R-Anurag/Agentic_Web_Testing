import * as vscode from "vscode";

export class DadViewProvider
  implements vscode.WebviewViewProvider {

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {}

  resolveWebviewView(view: vscode.WebviewView) {

    view.webview.options = {
      enableScripts: true
    };

    const nonce = getNonce();

    view.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <!-- Security -->
        <meta
          http-equiv="Content-Security-Policy"
          content="
            default-src 'none';
            script-src 'nonce-${nonce}';
            style-src 'unsafe-inline';
          "
        />

        <style>
          body {
            font-family: system-ui, sans-serif;
            padding: 12px;
          }
          button {
            padding: 10px 14px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          button:hover {
            opacity: 0.9;
          }
        </style>
      </head>

      <body>
        <h3>DAD Agent</h3>
        <button id="start">
          ▶ Start DAD Test
        </button>

        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();

          document
            .getElementById("start")
            .addEventListener("click", () => {
              vscode.postMessage({
                command: "start"
              });
            });
        </script>
      </body>
      </html>
    `;

    view.webview.onDidReceiveMessage(
      msg => {
        if (msg.command === "start") {
          vscode.commands.executeCommand(
            "dad.start"
          );
        }
      }
    );
  }
}

/* ---------- helpers ---------- */

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(
      Math.floor(Math.random() * possible.length)
    );
  }
  return text;
}
