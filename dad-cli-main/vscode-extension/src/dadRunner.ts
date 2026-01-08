import * as vscode from "vscode";
import * as path from "path";

export async function runDAD() {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    vscode.window.showErrorMessage("Please open a project folder.");
    return;
  }

  const url = await vscode.window.showInputBox({
    prompt: "Enter URL to test",
    value: "http://localhost:3000"
  });

  if (!url) return;

  const runtimePath = path.join(
    workspace.uri.fsPath,
    "runtime-discovery"
  );

  const terminal = vscode.window.createTerminal("DAD Test");
  terminal.show();
  terminal.sendText(`cd "${runtimePath}" && npm run start ${url}`);
}
