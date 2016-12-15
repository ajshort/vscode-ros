import * as pfs from "./promise-fs";
import * as utils from "./utils";
import * as vscode from "vscode";

/**
 * The catkin workspace base dir.
 */
export let baseDir: string;

export async function activate(context: vscode.ExtensionContext) {
  // Activate if we're in a catkin workspace.
  baseDir = await utils.findCatkinWorkspace(vscode.workspace.rootPath);

  if (!baseDir) {
    return;
  }
}

/**
 * Loads the ROS environment, and prompts the user to select a distro if required.
 */
async function sourceRosAndWorkspace(): Promise<any> {
  let env: any;

  const config = utils.getConfig();
  const distro = config.get("distro", "");

  if (distro) {
    try {
      env = await utils.sourceSetupFile(`/opt/ros/${distro}/setup.bash`, {});
    } catch (err) {
      vscode.window.showErrorMessage(`Could not source the setup file for ROS distro "${distro}".`);
      return;
    }
  } else if (typeof process.env.ROS_ROOT !== "undefined") {
    env = process.env;
  } else {
    const message = "The ROS distro is not configured.";
    const configure = "Configure";

    if (await vscode.window.showErrorMessage(message, configure) === configure) {
      config.update("distro", await vscode.window.showQuickPick(utils.getDistros()));
    }

    return;
  }

  // Source the workspace setup over the top.
  const workspaceSetup = `${baseDir}/devel/setup.bash`;

  if (await pfs.exists(workspaceSetup)) {
    try {
      env = await utils.sourceSetupFile(workspaceSetup, env);
    } catch (err) {
      vscode.window.showWarningMessage("Could not source the workspace setup file.");
    }
  }

  return env;
}
