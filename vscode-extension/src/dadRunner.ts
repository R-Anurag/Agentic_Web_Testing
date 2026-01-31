import * as vscode from "vscode";
import * as path from "path";

export async function runDAD() {

  const workspace =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    vscode.window.showErrorMessage(
      "Please open a project folder first."
    );
    return;
  }

  const url = await vscode.window.showInputBox({
    prompt: "Enter URL to test",
    value: "http://localhost:3000"
  });

  if (!url) return;

  const headful = await vscode.window.showQuickPick(
    ["Yes", "No"],
    { placeHolder: "Show browser window?" }
  );

  if (!headful) return;

  // 🔥 FIXED PATH (matches your real structure)
  const runtimePath = path.join(
    workspace.uri.fsPath,
    "dad-cli",
    "dad-cli-main",
    "runtime-discovery"
  );

  const terminal =
    vscode.window.createTerminal("DAD Test");

  terminal.show();

  const headfulFlag =
    headful === "Yes" ? " --headful" : "";

  // PowerShell safe
  terminal.sendText(
    `cd "${runtimePath}"; npm run start -- ${url}${headfulFlag}`
  );
}
