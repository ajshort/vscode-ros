import * as extension from "./extension";
import * as cp from "child_process";
import * as vscode from "vscode";

/**
 * Interacts with the user to run a `catkin_create_pkg` command.
 */
export async function createPackage(uri?: vscode.Uri) {
  const name = await vscode.window.showInputBox({
    prompt: "Package name",
    validateInput: val => val.match(/^\w+$/) ? "" : "Invalid name",
  });

  if (!name) {
    return;
  }

  const dependencies = await vscode.window.showInputBox({
    prompt: "Dependencies",
    validateInput: val => val.match(/^\s*(\w+\s*)*$/) ? "" : "Invalid dependencies",
  });

  if (typeof dependencies === "undefined") {
    return;
  }

  const cwd = typeof uri !== "undefined" ? uri.fsPath : vscode.workspace.rootPath;
  const opts = { cwd, env: extension.env };

  cp.exec(`catkin_create_pkg ${name} ${dependencies}`, opts, (err, stdout, stderr) => {
    if (!err) {
      vscode.workspace.openTextDocument(`${cwd}/${name}/package.xml`).then(vscode.window.showTextDocument);
    } else {
      let message = "Could not create package";
      let index = stderr.indexOf("error:");

      if (index !== -1) {
        message += ": " + stderr.substr(index);
      }

      vscode.window.showErrorMessage(message);
    }
  });
}
