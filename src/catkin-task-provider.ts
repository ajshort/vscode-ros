import * as extension from "./extension";
import * as vscode from "vscode";

/**
 * Provides catkin build and test tasks.
 */
export default class CatkinTaskProvider implements vscode.TaskProvider {
  public provideTasks(token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
    const command = `catkin_make --directory "${extension.baseDir}"`;

    const make = new vscode.Task({ type: "catkin" }, "make", "catkin");
    make.execution = new vscode.ShellExecution(command, {
      env: extension.env
    });
    make.group = vscode.TaskGroup.Build;
    make.problemMatchers = ["$catkin-gcc"];

    const test = new vscode.Task({ type: "catkin", target: "run_tests" }, "run_tests", "catkin");
    test.execution = new vscode.ShellExecution(`${command} run_tests`, {
      env: extension.env
    });
    test.group = vscode.TaskGroup.Test;

    return [make, test];
  }

  public resolveTask(task: vscode.Task, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
    return undefined;
  }
}
