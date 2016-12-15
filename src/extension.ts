import * as constants from "./constants";
import * as master from "./master";
import * as pfs from "./promise-fs";
import * as utils from "./utils";
import * as vscode from "vscode";

/**
 * The catkin workspace base dir.
 */
export let baseDir: string;

/**
 * The sourced ROS environment.
 */
export let env: any;

export async function activate(context: vscode.ExtensionContext) {
  // Activate if we're in a catkin workspace.
  baseDir = await utils.findCatkinWorkspace(vscode.workspace.rootPath);

  if (!baseDir) {
    return;
  }

  // Register commands.
  context.subscriptions.push(
    vscode.commands.registerCommand(constants.CMD_SHOW_MASTER_STATUS, master.showMasterStatus),
  );

  // Source the environment, and re-source on config change.
  let config = utils.getConfig();

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
    const updatedConfig = utils.getConfig();
    const fields = Object.keys(config).filter(k => !(config[k] instanceof Function));
    const changed = fields.some(key => updatedConfig[key] !== config[key]);

    if (changed) {
      sourceRosAndWorkspace();
    }

    config = updatedConfig;
  }));

  sourceRosAndWorkspace();
}

/**
 * Loads the ROS environment, and prompts the user to select a distro if required.
 */
async function sourceRosAndWorkspace(): Promise<void> {
  env = undefined;

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
}
