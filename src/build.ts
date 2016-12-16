import * as extension from "./extension";
import * as pfs from "./promise-fs";
import * as utils from "./utils";
import * as vscode from "vscode";

const PYTHON_AUTOCOMPLETE_PATHS = "python.autoComplete.extraPaths";

/**
 * Creates config files which don't exist.
 */
export function createConfigFiles() {
  const config = vscode.workspace.getConfiguration();

  if (!config.has("tasks")) {
    updateBuildTasks();
  }

  if (config.get(PYTHON_AUTOCOMPLETE_PATHS, []).length === 0) {
    updatePythonPath();
  }

  pfs.exists(vscode.workspace.rootPath + "/.vscode/c_cpp_properties.json").then(exists => {
    if (!exists) {
      updateCppProperties();
    }
  });
}

/**
 * Updates the VSCode `tasks.json` with catkin tasks.
 */
export function updateBuildTasks() {
  vscode.workspace.getConfiguration().update("tasks", {
    args: ["--directory", extension.baseDir],
    command: "catkin_make",
    isShellCommand: true,
    options: { env: extension.env },
    problemMatcher: {
      fileLocation: "absolute",
      owner: "catkin_make",
      pattern: {
        column: 3,
        file: 1,
        line: 2,
        message: 5,
        regexp: "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
        severity: 4,
      },
    },
    showOutput: "silent",
    version: "0.1.0",
  });
}

/**
 * Updates the `c_cpp_properties.json` file with ROS include paths.
 */
export async function updateCppProperties(): Promise<void> {
  const includeDirs = await utils.getIncludeDirs();
  const filename = vscode.workspace.rootPath + "/.vscode/c_cpp_properties.json";

  await pfs.writeFile(filename, JSON.stringify({
    configurations: [
      {
        browse: { databaseFilename: "", limitSymbolsToIncludedHeaders: true },
        includePath: [...includeDirs, "/usr/include"],
        name: "Linux",
      },
    ],
  }, undefined, 2));
}

/**
 * Updates the python autocomplete path to support ROS.
 */
export function updatePythonPath() {
  vscode.workspace.getConfiguration().update(PYTHON_AUTOCOMPLETE_PATHS, extension.env.PYTHONPATH.split(":"));
}
