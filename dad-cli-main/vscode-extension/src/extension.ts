import * as vscode from "vscode";
import { runDAD } from "./dadRunner";
import { DadViewProvider } from "./dadView";

export function activate(context: vscode.ExtensionContext) {
  console.log("DAD extension activating");

  // Command
  context.subscriptions.push(
    vscode.commands.registerCommand("dad.start", runDAD)
  );

  // Status bar button
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "▶ DAD Test";
  statusBarItem.tooltip = "Start DAD Runtime Test";
  statusBarItem.command = "dad.start";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // ✅ REGISTER VIEW PROVIDER (THIS FIXES THE ERROR)
  const provider = new DadViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "dadView",
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );
}

export function deactivate() {}
