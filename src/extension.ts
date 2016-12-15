import * as utils from "./utils";
import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  const baseDir = await utils.findCatkinWorkspace(vscode.workspace.rootPath);
}
