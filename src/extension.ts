import * as pfs from "./promise-fs";
import { dirname } from "path";
import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  const baseDir = await findCatkinWorkspace(vscode.workspace.rootPath);
}

/**
 * Traverses up directories to find a catkin workspace.
 */
async function findCatkinWorkspace(dir: string): Promise<string> {
  while (dir && dirname(dir) !== dir) {
    if (await pfs.exists(`${dir}/.catkin_workspace`)) {
      return dir;
    }

    dir = dirname(dir);
  }
}
