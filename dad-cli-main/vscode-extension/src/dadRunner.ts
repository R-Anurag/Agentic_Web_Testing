import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";

export async function runDAD() {

  const workspace =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    vscode.window.showErrorMessage(
      "Please open a project folder."
    );
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

  vscode.window.showInformationMessage(
    "Starting DAD runtime discovery..."
  );

  const child = spawn('npm', ['run', 'start', url], {
    cwd: runtimePath,
    shell: true,
    env: { ...process.env, PATH: process.env.PATH }
  });

  child.on('error', (error) => {
    vscode.window.showErrorMessage(
      "DAD failed: " + error.message
    );
  });

  child.on('close', (code) => {
    if (code === 0) {
      vscode.window.showInformationMessage(
        "DAD completed successfully"
      );
    } else {
      vscode.window.showErrorMessage(
        `DAD failed with exit code ${code}`
      );
    }
  });
}
