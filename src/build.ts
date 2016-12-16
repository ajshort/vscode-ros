import * as extension from "./extension";
import * as pfs from "./promise-fs";
import * as utils from "./utils";
import * as vscode from "vscode";

/**
 * Creates config files which don't exist.
 */
export async function createConfigFiles() {
  if (!vscode.workspace.getConfiguration().has("tasks")) {
    updateBuildTasks();
  }

  if (!await pfs.exists(vscode.workspace.rootPath + "/.vscode/c_cpp_properties.json")) {
    updateCppProperties();
  }
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
