import * as build from "./build";
import * as catkin from "./catkin";
import * as constants from "./constants";
import CppFormatter from "./cpp-formatter";
import * as debug from "./debug";
import * as master from "./master";
import * as pfs from "./promise-fs";
import * as utils from "./utils";
import * as vscode from "vscode";

let context: vscode.ExtensionContext;

/**
 * The catkin workspace base dir.
 */
export let baseDir: string;

/**
 * The sourced ROS environment.
 */
export let env: any;

let onEnvChanged = new vscode.EventEmitter<void>();

/**
 * Triggered when the env is soured.
 */
export let onDidChangeEnv = onEnvChanged.event;

/**
 * Subscriptions to dispose when the environment is changed.
 */
let subscriptions = <vscode.Disposable[]> [];

export async function activate(ctx: vscode.ExtensionContext) {
  // Activate if we're in a catkin workspace.
  context = ctx;
  baseDir = await utils.findCatkinWorkspace(vscode.workspace.rootPath);

  if (!baseDir) {
    return;
  }

  // Activate components when the ROS env is changed.
  context.subscriptions.push(onDidChangeEnv(activateEnvironment));

  // Activate components which don't require the ROS env.
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
    "cpp", new CppFormatter()
  ));

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

  return {
    getBaseDir: () => baseDir,
    getEnv: () => env,
    onDidChangeEnv: (listener: () => any, thisArg: any) => onDidChangeEnv(listener, thisArg),
  };
}

export function deactivate() {
  subscriptions.forEach(disposable => disposable.dispose());
}

/**
 * Activates components which require a ROS env.
 */
function activateEnvironment() {
  // Clear existing disposables.
  while (subscriptions.length > 0) {
    subscriptions.pop().dispose();
  }

  if (typeof env.ROS_ROOT === "undefined") {
    return;
  }

  // Set up the master.
  const masterApi = new master.XmlRpcApi(env.ROS_MASTER_URI);
  const masterStatusItem = new master.StatusBarItem(masterApi);
  const masterStatusProvider = new master.StatusDocumentProvider(context, masterApi);

  masterStatusItem.activate();

  subscriptions.push(masterStatusItem);
  subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("ros-master", masterStatusProvider));

  // Register commands.
  subscriptions.push(
    vscode.commands.registerCommand(constants.CMD_CREATE_CATKIN_PACKAGE, catkin.createPackage),
    vscode.commands.registerCommand(constants.CMD_GET_DEBUG_SETTINGS, debug.getDebugSettings),
    vscode.commands.registerCommand(constants.CMD_PROVIDE_INITIAL_CONFIGURATIONS, debug.provideInitialConfigurations),
    vscode.commands.registerCommand(constants.CMD_SHOW_MASTER_STATUS, master.showMasterStatus),
    vscode.commands.registerCommand(constants.CMD_START_CORE, master.startCore),
    vscode.commands.registerCommand(constants.CMD_STOP_CORE, () => master.stopCore(masterApi)),
    vscode.commands.registerCommand(constants.CMD_UPDATE_BUILD_TASKS, build.updateBuildTasks),
    vscode.commands.registerCommand(constants.CMD_UPDATE_CPP_PROPERTIES, build.updateCppProperties),
    vscode.commands.registerCommand(constants.CMD_UPDATE_PYTHON_PATH, build.updatePythonPath),
  );

  // Generate config files if they don't already exist.
  build.createConfigFiles();
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
    }
  } else if (typeof process.env.ROS_ROOT !== "undefined") {
    env = process.env;
  } else {
    const message = "The ROS distro is not configured.";
    const configure = "Configure";

    if (await vscode.window.showErrorMessage(message, configure) === configure) {
      config.update("distro", await vscode.window.showQuickPick(utils.getDistros()));
    }
  }

  // Source the workspace setup over the top.
  const workspaceSetup = `${baseDir}/devel/setup.bash`;

  if (env && typeof env.ROS_ROOT !== "undefined" && await pfs.exists(workspaceSetup)) {
    try {
      env = await utils.sourceSetupFile(workspaceSetup, env);
    } catch (err) {
      vscode.window.showWarningMessage("Could not source the workspace setup file.");
    }
  }

  // Notify listeners the environment has changed.
  onEnvChanged.fire();
}
