import * as utils from "./utils";
import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  const baseDir = await utils.findCatkinWorkspace(vscode.workspace.rootPath);

  if (!baseDir) {
    return;
  }

  setup();
}

/**
 * Loads the ROS environment, and prompts the user to select a distro if required.
 */
async function setup() {
  let env = {};

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
}
