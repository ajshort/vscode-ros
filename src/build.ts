import * as extension from "./extension";
import * as vscode from "vscode";

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
