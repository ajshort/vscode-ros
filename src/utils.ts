import * as pfs from "./promise-fs";
import * as cp from "child_process";
import { dirname } from "path";
import * as vscode from "vscode";

/**
 * Gets the ROS config section.
 */
export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("ros");
}

/**
 * Traverses up directories to find a catkin workspace.
 */
export async function findCatkinWorkspace(dir: string): Promise<string> {
  while (dir && dirname(dir) !== dir) {
    if (await pfs.exists(`${dir}/.catkin_workspace`)) {
      return dir;
    }

    dir = dirname(dir);
  }
}

/**
 * Gets the names of installed distros.
 */
export function getDistros(): Promise<string[]> {
  return pfs.readdir("/opt/ros");
}

/**
 * Executes a setup file and returns the resulting env.
 */
export function sourceSetupFile(filename: string, env?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    cp.exec(`bash -c "source '${filename}' && env"`, { env }, (err, out) => {
      if (!err) {
        resolve(out.split("\n").reduce((env, line) => {
          const index = line.indexOf("=");

          if (index !== -1) {
            env[line.substr(0, index)] = line.substr(index + 1);
          }

          return env;
        }, {}));
      } else {
        reject(err);
      }
    });
  });
}
